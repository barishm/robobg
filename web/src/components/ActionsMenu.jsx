// Three vertical dots that open a dropdown of admin actions (change image,
// edit, delete...). Each item opens a Bootstrap modal (modalTarget) and/or
// runs onClick first, e.g. to remember which entity the modal is for.
//
// items: [{ label, icon, modalTarget, onClick, danger }]
const ActionsMenu = ({ items, className = '', style }) => (
  <div className={`dropdown ${className}`} style={style}>
    <button
      type="button"
      className="btn btn-light btn-sm rounded-circle d-flex align-items-center justify-content-center border"
      style={{ width: '32px', height: '32px' }}
      data-bs-toggle="dropdown"
      aria-expanded="false"
      aria-label="Actions"
      title="Actions"
    >
      <i className="fa-solid fa-ellipsis-vertical"></i>
    </button>
    <ul className="dropdown-menu dropdown-menu-end shadow-sm">
      {items.map(({ label, icon, modalTarget, onClick, danger }) => (
        <li key={label}>
          <button
            type="button"
            className={`dropdown-item d-flex align-items-center gap-2${danger ? ' text-danger' : ''}`}
            onClick={onClick}
            {...(modalTarget ? { 'data-bs-toggle': 'modal', 'data-bs-target': modalTarget } : {})}
          >
            {icon && <i className={`fa-solid ${icon} fa-fw`}></i>}
            {label}
          </button>
        </li>
      ))}
    </ul>
  </div>
);

export default ActionsMenu;
