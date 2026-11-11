import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

const TOGGLE_AVATAR_SIZE = 28;
const MENU_AVATAR_SIZE = 56;

const avatarStyle = (size) => ({
  width: size,
  height: size,
  borderRadius: '50%',
  objectFit: 'cover',
});

const UserMenu = ({ className, username, profilePicture, onChangePicture, onRemovePicture, onSignOut }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);

  const openFilePicker = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    // Reset so picking the same file again still fires onChange.
    e.target.value = '';
    if (file) onChangePicture(file);
  };

  return (
    <div className={`dropdown ${className}`}>
      <button
        className="dropdown-toggle me-md-1 btn btn-primary rounded-5 d-flex align-items-center"
        data-bs-toggle="dropdown"
        data-bs-auto-close="outside"
        aria-expanded="false"
        aria-label={t('userMenu')}
      >
        {profilePicture ? (
          <img
            src={profilePicture}
            alt={username}
            style={{ ...avatarStyle(TOGGLE_AVATAR_SIZE), border: '2px solid #fff' }}
          />
        ) : (
          <i className="fa-solid fa-user"></i>
        )}
      </button>
      <ul className="dropdown-menu dropdown-menu-end" style={{ minWidth: 240 }}>
        <li className="px-3 py-2 d-flex align-items-center gap-3">
          <button
            type="button"
            className="p-0 border-0 bg-transparent position-relative flex-shrink-0"
            onClick={openFilePicker}
            title={profilePicture ? t('changeProfilePicture') : t('addProfilePicture')}
            aria-label={profilePicture ? t('changeProfilePicture') : t('addProfilePicture')}
          >
            {profilePicture ? (
              <img src={profilePicture} alt={username} style={avatarStyle(MENU_AVATAR_SIZE)} />
            ) : (
              <span
                className="d-flex align-items-center justify-content-center bg-secondary-subtle text-secondary"
                style={avatarStyle(MENU_AVATAR_SIZE)}
              >
                <i className="fa-solid fa-user fa-lg"></i>
              </span>
            )}
            <span
              className="position-absolute bottom-0 end-0 d-flex align-items-center justify-content-center bg-primary text-white rounded-circle border border-white"
              style={{ width: 22, height: 22, fontSize: 11 }}
            >
              <i className="fa-solid fa-camera"></i>
            </span>
          </button>
          <div className="d-flex flex-column" style={{ minWidth: 0 }}>
            <span className="fw-semibold text-truncate">@{username}</span>
            <div className="d-flex gap-2 small">
              <button type="button" className="btn btn-link btn-sm p-0" onClick={openFilePicker}>
                {profilePicture ? t('change') : t('addProfilePicture')}
              </button>
              {profilePicture && (
                <button type="button" className="btn btn-link btn-sm p-0 text-danger" onClick={onRemovePicture}>
                  {t('remove')}
                </button>
              )}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="d-none"
            onChange={handleFileChange}
          />
        </li>
        <li>
          <hr className="dropdown-divider" />
        </li>
        <li>
          <button className="dropdown-item" onClick={onSignOut}>
            <i className="fa-solid fa-right-from-bracket me-2"></i>
            {t('signOut')}
          </button>
        </li>
      </ul>
    </div>
  );
};

export default UserMenu;
