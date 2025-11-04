import React, { useEffect, useState, useRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import app, { db, auth } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { getDatabase, ref as rtdbRef, get as rtdbGet, update as rtdbUpdate } from 'firebase/database';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';

function CropModal({ imageSrc, onSave, onClose }) {
  const canvasRef = useRef(null);
  const [cropArea, setCropArea] = useState({ x: 25, y: 25, size: 350 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef(null);
  const [previewQuality, setPreviewQuality] = useState(0.9);
  const [previewMime, setPreviewMime] = useState('image/jpeg');
  const [previewSizeKB, setPreviewSizeKB] = useState(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
      drawCanvas();
    };
    img.src = imageSrc;
  }, [imageSrc]);

  useEffect(() => {
    if (imageLoaded) {
      drawCanvas();
    }
  }, [cropArea, imageLoaded]);

  function drawCanvas() {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;

    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    
    canvas.width = 400;
    canvas.height = 400;

    const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;
    const x = (canvas.width - scaledWidth) / 2;
    const y = (canvas.height - scaledHeight) / 2;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.clearRect(cropArea.x, cropArea.y, cropArea.size, cropArea.size);
    ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.strokeRect(cropArea.x, cropArea.y, cropArea.size, cropArea.size);
  }

  // create a cropped canvas (same logic as handleSave) and return { canvas, dataUrl }
  function createCroppedCanvas(quality = 0.9, mime = 'image/jpeg') {
    const img = imageRef.current;
    if (!img) return null;

    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = cropArea.size;
    cropCanvas.height = cropArea.size;
    const cropCtx = cropCanvas.getContext('2d');

    const scale = Math.max(400 / img.width, 400 / img.height);
    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;
    const offsetX = (400 - scaledWidth) / 2;
    const offsetY = (400 - scaledHeight) / 2;

    const sourceX = (cropArea.x - offsetX) / scale;
    const sourceY = (cropArea.y - offsetY) / scale;
    const sourceSize = cropArea.size / scale;

    cropCtx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceSize,
      sourceSize,
      0,
      0,
      cropArea.size,
      cropArea.size
    );

    const dataUrl = cropCanvas.toDataURL(mime, quality);
    return { canvas: cropCanvas, dataUrl };
  }

  function handleMouseDown(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (
      x >= cropArea.x &&
      x <= cropArea.x + cropArea.size &&
      y >= cropArea.y &&
      y <= cropArea.y + cropArea.size
    ) {
      setIsDragging(true);
      setDragStart({ x: x - cropArea.x, y: y - cropArea.y });
    }
  }

  function handleMouseMove(e) {
    if (!isDragging) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragStart.x;
    const y = e.clientY - rect.top - dragStart.y;

    const maxX = 400 - cropArea.size;
    const maxY = 400 - cropArea.size;

    setCropArea({
      ...cropArea,
      x: Math.max(0, Math.min(x, maxX)),
      y: Math.max(0, Math.min(y, maxY))
    });
  }

  function handleMouseUp() {
    setIsDragging(false);
  }

  async function handleSave() {
    // default save: try to compress to target 5 KB automatically, falling back to current preview
    const TARGET = 5 * 1024;
    let dataUrl = null;

    // attempt compression to target
    try {
      const compressed = await compressToTargetSize(TARGET, 'image/jpeg');
      if (compressed) dataUrl = compressed;
    } catch (e) {
      console.warn('Auto-compress failed', e);
    }

    // if compression didn't produce a result, use current preview settings
    if (!dataUrl) {
      const out = createCroppedCanvas(previewQuality, previewMime);
      if (!out) return;
      dataUrl = out.dataUrl;
    }

    onSave(dataUrl);
  }

  useEffect(() => {
    let mounted = true;
    async function computePreview() {
      try {
        const out = createCroppedCanvas(previewQuality, previewMime);
        if (!out) {
          if (mounted) setPreviewSizeKB(null);
          return;
        }
        // convert dataUrl to blob via fetch
        const resp = await fetch(out.dataUrl);
        const blob = await resp.blob();
        if (mounted) setPreviewSizeKB(Math.round(blob.size / 1024));
      } catch (e) {
        if (mounted) setPreviewSizeKB(null);
      }
    }
    computePreview();
    return () => { mounted = false; };
  }, [cropArea, previewQuality, previewMime, imageLoaded]);

  // Attempt to find the highest JPEG quality that produces an image <= targetBytes
  async function compressToTargetSize(targetBytes = 5120, mime = 'image/jpeg') {
    // binary search over quality between 0.3 and 1.0
    const minQ = 0.3;
    const maxQ = 1.0;
    let low = minQ;
    let high = maxQ;
    let best = null;
    const maxIter = 10;

    for (let i = 0; i < maxIter; i++) {
      const q = (low + high) / 2;
      const out = createCroppedCanvas(q, mime);
      if (!out) break;
      try {
        const resp = await fetch(out.dataUrl);
        const blob = await resp.blob();
        if (blob.size <= targetBytes) {
          // acceptable, try higher quality
          best = { dataUrl: out.dataUrl, size: blob.size, quality: q };
          low = q; // try improve quality
        } else {
          // too big, reduce quality
          high = q;
        }
        if ((high - low) < 0.005) break;
      } catch (e) {
        console.error('compressToTargetSize error', e);
        break;
      }
    }

    if (best) {
      // update UI preview values
      setPreviewQuality(best.quality);
      setPreviewMime(mime);
      setPreviewSizeKB(Math.round(best.size / 1024));
      return best.dataUrl;
    }

    // fallback: return lowest-quality image
    const fallback = createCroppedCanvas(minQ, mime);
    if (!fallback) return null;
    try {
      const resp = await fetch(fallback.dataUrl);
      const blob = await resp.blob();
      setPreviewQuality(minQ);
      setPreviewMime(mime);
      setPreviewSizeKB(Math.round(blob.size / 1024));
    } catch (e) {
      // ignore
    }
    return fallback.dataUrl;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose}>
      <div className="min-h-screen p-8 grid place-items-center overflow-auto">
        <div 
          className="bg-white border-4 border-black p-12 w-full max-w-2xl max-h-[80vh] overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="border-b-2 border-black pb-6 mb-8 relative">
            <h2 className="text-3xl font-bold text-black tracking-tight">Crop Photo</h2>
            <button
              type="button"
              className="absolute right-0 top-0 w-10 h-10 border-2 border-black hover:bg-black hover:text-white transition-colors font-bold text-xl"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="mb-8">
            <p className="text-xs font-bold text-black uppercase tracking-widest mb-4">
              Drag the box to crop your photo
            </p>
            <canvas
              ref={canvasRef}
              className="border-4 border-black mx-auto cursor-move"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-xs font-bold text-black uppercase tracking-widest">Preview Quality</label>
            <div className="flex items-center gap-4">
              <input type="range" min="0.3" max="1" step="0.05" value={previewQuality} onChange={(e) => setPreviewQuality(parseFloat(e.target.value))} />
              <div className="text-sm font-mono">{Math.round(previewQuality * 100)}%</div>
              <div className="ml-auto text-sm text-black">{previewSizeKB ? `${previewSizeKB} KB` : 'calculating...'}</div>
            </div>
            <div className="mt-3 flex gap-3">
              <button
                type="button"
                className="px-4 py-2 border-2 border-black bg-white text-black text-sm hover:bg-black hover:text-white transition-colors"
                onClick={async () => {
                  // auto compress to ~5 KB
                  const dataUrl = await compressToTargetSize(5 * 1024, 'image/jpeg');
                  if (dataUrl) {
                    // set avatar preview in modal (but don't close modal)
                    // update previewSizeKB already done in compressToTargetSize
                    // also update the main previewQuality
                  } else {
                    alert('Automatic compression failed. Try reducing crop size.');
                  }
                }}
              >
                Auto → 5 KB
              </button>
              <button
                type="button"
                className="px-4 py-2 border-2 border-black bg-white text-black text-sm hover:bg-black hover:text-white transition-colors"
                onClick={async () => {
                  // auto compress to 10 KB as a gentler option
                  const dataUrl = await compressToTargetSize(10 * 1024, 'image/jpeg');
                  if (!dataUrl) alert('Automatic compression failed. Try reducing crop size.');
                }}
              >
                Auto → 10 KB
              </button>
            </div>
          </div>

          <div className="border-t-2 border-black pt-8">
            <div className="grid grid-cols-2 gap-4">
              <button 
                type="button"
                className="px-6 py-4 bg-white text-black border-2 border-black font-medium uppercase text-sm tracking-wide hover:bg-black hover:text-white transition-colors"
                onClick={onClose}
              >
                Cancel
              </button>
              <button 
                type="button"
                className="px-6 py-4 bg-black text-white border-2 border-black font-medium uppercase text-sm tracking-wide hover:bg-gray-800 transition-colors"
                onClick={handleSave}
              >
                Save Photo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChangePasswordModal({ onClose }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const user = auth && auth.currentUser;
  const usesPasswordProvider = !!(user && (user.providerData || []).some(p => p.providerId === 'password'));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const user = auth && auth.currentUser;
    const providers = (user && (user.providerData || []).map(p => p.providerId)) || [];
    const usesPasswordProvider = providers.includes('password');

    if (usesPasswordProvider && !currentPassword) {
      setError('CURRENT PASSWORD IS REQUIRED');
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError('NEW PASSWORD AND CONFIRMATION ARE REQUIRED');
      return;
    }

    if (newPassword.length < 8) {
      setError('PASSWORD MUST BE AT LEAST 8 CHARACTERS');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('PASSWORDS DO NOT MATCH');
      return;
    }

    setLoading(true);
    try {
      const user = auth && auth.currentUser;
      if (!user) throw new Error('NOT_SIGNED_IN');

      const providers = (user.providerData || []).map(p => p.providerId);
      const usesPasswordProvider = providers.includes('password');

      if (usesPasswordProvider) {
        // require current password and reauthenticate
        if (!user.email) throw new Error('NO_EMAIL');
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
      } else {
        // account signed in via provider (e.g., Google) — no current password stored
        // Try to set a password directly; this may fail if reauthentication is required
        await updatePassword(user, newPassword);
      }

      setSuccess(true);
      setTimeout(() => {
        setLoading(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Change password error', err);
      let msg = 'Failed to change password.';
      // Firebase auth error codes
      if (err.code === 'auth/wrong-password') msg = 'Current password is incorrect.';
      if (err.code === 'auth/weak-password') msg = 'New password is too weak.';
      if (err.code === 'auth/invalid-credential') msg = 'Invalid credential. Please re-enter your current password.';
        if (err.message === 'NOT_SIGNED_IN') msg = 'You must be signed in to change your password.';
        if (err.message === 'NO_PASSWORD_PROVIDER') msg = 'Your account does not use an email/password sign-in. To change password, sign in with email/password first or use your provider account to manage credentials.';
        if (err.message === 'NO_EMAIL') msg = 'No email available on this account; cannot reauthenticate with password.';
        if (err.code === 'auth/requires-recent-login') msg = 'Please re-login and try again.';
      setError(msg);
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose}>
      <div className="min-h-screen p-8 grid place-items-center">
        <div 
          className="bg-white border-4 border-black p-12 w-full max-w-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="border-b-2 border-black pb-6 mb-8 relative">
            <h2 className="text-3xl font-bold text-black tracking-tight">Change Password</h2>
            <button
              type="button"
              className="absolute right-0 top-0 w-10 h-10 border-2 border-black hover:bg-black hover:text-white transition-colors font-bold text-xl"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {success ? (
            <div className="py-12 text-center">
              <div className="text-6xl mb-4">✓</div>
              <p className="text-xl font-bold text-black uppercase tracking-wide">Password Changed</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {usesPasswordProvider && (
                <div className="mb-8">
                  <label className="block mb-3">
                    <span className="text-xs font-bold text-black uppercase tracking-widest">Current Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrent ? "text" : "password"}
                      className="w-full px-4 py-4 pr-12 border-2 border-black text-black text-lg focus:outline-none focus:border-gray-600 transition-colors"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-black hover:text-gray-600"
                      onClick={() => setShowCurrent(!showCurrent)}
                      disabled={loading}
                    >
                      {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              )}

              <div className="mb-8">
                <label className="block mb-3">
                  <span className="text-xs font-bold text-black uppercase tracking-widest">New Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    className="w-full px-4 py-4 pr-12 border-2 border-black text-black text-lg focus:outline-none focus:border-gray-600 transition-colors"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-black hover:text-gray-600"
                    onClick={() => setShowNew(!showNew)}
                    disabled={loading}
                  >
                    {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="mb-8">
                <label className="block mb-3">
                  <span className="text-xs font-bold text-black uppercase tracking-widest">Confirm New Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    className="w-full px-4 py-4 pr-12 border-2 border-black text-black text-lg focus:outline-none focus:border-gray-600 transition-colors"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-black hover:text-gray-600"
                    onClick={() => setShowConfirm(!showConfirm)}
                    disabled={loading}
                  >
                    {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="mb-8 p-6 border-4 border-black bg-white">
                  <p className="text-center font-black text-black uppercase text-sm tracking-widest">
                    ⚠ {error}
                  </p>
                </div>
              )}

              <div className="border-t-2 border-black pt-8">
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    className="px-6 py-4 bg-white text-black border-2 border-black font-medium uppercase text-sm tracking-wide hover:bg-black hover:text-white transition-colors"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className={`px-6 py-4 border-2 border-black font-medium uppercase text-sm tracking-wide ${loading ? 'bg-gray-400 text-gray-800' : 'bg-black text-white hover:bg-gray-800'}`}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                        Updating...
                      </span>
                    ) : 'Update Password'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Settings({ onNavigate }) {
  const [username, setUsername] = useState('John Doe');
  const [avatar, setAvatar] = useState(null);
  const [status, setStatus] = useState('');
  const [original, setOriginal] = useState({ username: '', avatar: null });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImage, setTempImage] = useState(null);

  useEffect(() => {
    const storedData = localStorage.getItem('settings_data');
    if (storedData) {
      const parsed = JSON.parse(storedData);
      setUsername(parsed.username || 'John Doe');
      setAvatar(parsed.avatar || null);
      setOriginal({ username: parsed.username || 'John Doe', avatar: parsed.avatar || null });
    }
    // load cloudinary config (api_key, signUrl, cloud_name) if present
    (async () => {
      try {
        const cfg = await import('../../firebase').then(m => m.db);
        // read config from Firestore if available
        const { doc, getDoc } = await import('firebase/firestore');
        const docRef = doc(cfg, 'config', 'cloudinary');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.signUrl) setSignUrl(data.signUrl);
          if (data.cloud_name) setCloudName(data.cloud_name);
        }
      } catch (e) {
        // ignore if Firestore not configured here
      }
    })();

    // load username/profile from Realtime Database if present, fallback to auth displayName
    (async () => {
      try {
        const uid = localStorage.getItem('uid') || (auth && auth.currentUser && auth.currentUser.uid);
        if (!uid) return;
        const rdb = getDatabase(app);
        const userRef = rtdbRef(rdb, `users/${uid}`);
        const snap = await rtdbGet(userRef);
        if (snap && snap.exists()) {
          const val = snap.val();
          if (val.username) {
            setUsername(val.username);
            setOriginal(o => ({ ...o, username: val.username }));
          }
          if (val.avatar_base64 && !avatar) {
            setAvatar(val.avatar_base64);
            setOriginal(o => ({ ...o, avatar: val.avatar_base64 }));
          }
        } else {
          // fallback to auth displayName
          if (auth && auth.currentUser && auth.currentUser.displayName) {
            setUsername(auth.currentUser.displayName);
            setOriginal(o => ({ ...o, username: auth.currentUser.displayName }));
          }
        }
      } catch (e) {
        // ignore rtdb errors
      }
    })();
  }, []);

  const [signUrl, setSignUrl] = useState('');
  const [cloudName, setCloudName] = useState('');

  function handleSave() {
    (async () => {
      const data = { username, avatar };
      localStorage.setItem('settings_data', JSON.stringify(data));
      setOriginal({ username, avatar });
      setStatus('Saving changes...');

      try {
        const uid = localStorage.getItem('uid') || (auth && auth.currentUser && auth.currentUser.uid);
        if (uid) {
          // If there's an avatar, convert and save it to Firestore (keeping existing behavior).
          let blobType = null;
          if (avatar) {
            // Convert data URL to Blob and then to Uint8Array for storage
            let blob;
            try {
              const resp = await fetch(avatar);
              blob = await resp.blob();
            } catch (err) {
              // fallback: decode base64
              const base64 = avatar.split(',')[1] || '';
              const binary = atob(base64);
              const len = binary.length;
              const bytes = new Uint8Array(len);
              for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
              blob = new Blob([bytes], { type: 'image/png' });
            }

            blobType = blob.type || 'image/png';

            const arrayBuffer = await blob.arrayBuffer();
            const uint8 = new Uint8Array(arrayBuffer);

            // Save both base64 (convenience) and raw bytes (stored as an array of numbers) to Firestore
            await setDoc(doc(db, 'users', uid), {
              avatar_base64: avatar,
              avatar_bytes: Array.from(uint8),
              avatar_mime: blobType
            }, { merge: true });
          }

          // Always update Realtime Database with username and avatar info (avatar fields only if present)
          try {
            const rdb = getDatabase(app);
            const userRef = rtdbRef(rdb, `users/${uid}`);
            const updatePayload = { username: username };
            if (avatar) {
              updatePayload.avatar_base64 = avatar;
              updatePayload.avatar_mime = blobType || 'image/png';
            }
            await rtdbUpdate(userRef, updatePayload);
          } catch (e) {
            // ignore rtdb errors
          }

          setStatus('Changes saved');
        } else {
          setStatus('Saved locally (no user)');
        }
      } catch (e) {
        console.error('Failed saving avatar to Firestore', e);
        setStatus('Saved locally (failed to save to server)');
      }

      setTimeout(() => setStatus(''), 2000);
    })();
  }

  function handleDiscard() {
    setUsername(original.username);
    setAvatar(original.avatar);
    setStatus('Changes discarded');
    setTimeout(() => setStatus(''), 1500);
  }

  function handlePhotoChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    // enforce max file size before loading (100 KB)
    const MAX_BYTES = 100 * 1024; // 100 KB
    if (file.size > MAX_BYTES) {
      alert('Image must be 100 KB or smaller. Please choose a smaller file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setTempImage(ev.target.result);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  }

  async function handleCropSave(croppedImage) {
    // croppedImage is a data URL (base64). Convert to a Blob to get accurate byte size.
    try {
      const MAX_BYTES = 100 * 1024; // 100 KB

      // Use fetch on the data URL which returns a Response that can produce a Blob.
      let blob;
      try {
        const resp = await fetch(croppedImage);
        blob = await resp.blob();
      } catch (fetchErr) {
        // Fallback: decode base64 to get byte length (less accurate in some edge cases)
        const base64 = croppedImage.split(',')[1] || '';
        const byteLength = base64 ? atob(base64).length : 0;
        if (byteLength > MAX_BYTES) {
          alert('Cropped image is larger than 100 KB. Please crop to a smaller area or reduce quality.');
          return;
        }
        // build a blob from the decoded data
        const binary = atob(base64);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
        blob = new Blob([bytes], { type: 'image/png' });
      }

      if (blob.size > MAX_BYTES) {
        alert('Cropped image is larger than 100 KB. Please crop to a smaller area or reduce quality.');
        return;
      }

      // Use the data URL as avatar (keeps existing behavior). Also store blob if needed later.
      setAvatar(croppedImage);
      setShowCropModal(false);
      setTempImage(null);
    } catch (err) {
      console.error('Failed to validate image size', err);
      alert('Invalid image. Please try a different file.');
    }
  }

  return (
    <>
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-4">
            <button
              onClick={() => { window.location.href = '/dashboard'; }}
              className="text-sm text-black hover:underline flex items-center gap-2"
              aria-label="Back to dashboard"
            >
              <span className="text-xl">←</span>
              <span>Back to Dashboard</span>
            </button>
          </div>

          <h1 className="text-4xl font-bold text-black mb-12 tracking-tight">Settings</h1>

          <div className="border-t border-b border-black py-12 mb-12">
            <div className="grid grid-cols-2 gap-12 items-center">
              <div>
                <img 
                  className="w-48 h-48 object-cover border-2 border-black" 
                  src={avatar || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f0f0f0" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="48" fill="%23999"%3EJD%3C/text%3E%3C/svg%3E'} 
                  alt="Profile" 
                />
              </div>
              <div>
                <label className="block">
                  <span className="inline-block px-6 py-3 bg-black text-white font-medium tracking-wide uppercase text-sm cursor-pointer hover:bg-gray-800 transition-colors border-2 border-black">
                    Change Photo
                  </span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <label className="block mb-3">
              <span className="text-xs font-bold text-black uppercase tracking-widest">Name</span>
            </label>
            <input
              className="w-full px-4 py-4 border-2 border-black text-black text-lg focus:outline-none focus:border-gray-600 transition-colors"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="mb-12">
            <button 
              className="text-black underline hover:no-underline font-medium"
              onClick={() => setShowPasswordModal(true)}
            >
              Change password →
            </button>
          </div>

          <div className="border-t border-black pt-8">
            <div className="grid grid-cols-2 gap-4">
              <button 
                className="px-6 py-4 bg-white text-black border-2 border-black font-medium uppercase text-sm tracking-wide hover:bg-black hover:text-white transition-colors"
                onClick={handleDiscard}
              >
                Discard Changes
              </button>
              <button 
                className="px-6 py-4 bg-black text-white border-2 border-black font-medium uppercase text-sm tracking-wide hover:bg-gray-800 transition-colors"
                onClick={handleSave}
              >
                Save Changes
              </button>
            </div>
          </div>

          {status && (
            <div className="mt-6 p-4 bg-black text-white text-center font-medium uppercase text-sm tracking-wide">
              {status}
            </div>
          )}
        </div>
      </div>

      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}

      {showCropModal && tempImage && (
        <CropModal 
          imageSrc={tempImage} 
          onSave={handleCropSave}
          onClose={() => {
            setShowCropModal(false);
            setTempImage(null);
          }} 
        />
      )}
    </>
  );
}