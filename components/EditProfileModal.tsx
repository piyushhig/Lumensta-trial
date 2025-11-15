import React, { useState } from 'react';
import { User } from '../types';

interface EditProfileModalProps {
  user: User;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, onClose, onSave }) => {
  const [nickname, setNickname] = useState(user.nickname);
  const [bio, setBio] = useState(user.bio || '');
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarError(null); // Reset error on new selection
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

      if (!validImageTypes.includes(file.type)) {
        setAvatarError('Invalid file type. Please select an image (JPG, PNG, GIF, WebP).');
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setAvatarError('File is too large. Please select an image smaller than 2MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      onSave({ ...user, nickname: nickname.trim(), bio: bio.trim(), avatar });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in-and-scale-up">
      <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
        <form onSubmit={handleSave}>

          <div className="flex items-center gap-4 mb-6">
            <img 
              src={avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${nickname}`} 
              alt="Avatar Preview" 
              className="w-20 h-20 rounded-full object-cover bg-gray-700" 
            />
            <div>
              <label htmlFor="avatar-upload" className="block text-sm font-medium text-gray-300 mb-2">
                Update Picture
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleAvatarChange}
                className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-teal-300 hover:file:bg-gray-600 cursor-pointer"
              />
               {avatarError && <p className="text-red-400 text-xs mt-2">{avatarError}</p>}
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-300 mb-2">
              Nickname
            </label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

           <div className="mb-4">
            <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">
              Bio (optional)
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="A short bio about yourself"
              rows={3}
              maxLength={150}
            />
            <p className="text-right text-xs text-gray-400 mt-1">{bio.length} / 150</p>
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-teal-600 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;