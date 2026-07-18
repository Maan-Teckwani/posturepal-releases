// Bordered frame for product visuals (videos / UI shots). `chrome` adds the
// browser-dots title bar with a monospace label.
const MediaFrame = ({ children, label, chrome = false, hero = false }) => (
  <div className={`frame${hero ? ' frame--hero' : ''}`}>
    {chrome && (
      <div className="frame-bar">
        <span className="frame-dot" />
        <span className="frame-dot" />
        <span className="frame-dot frame-dot--accent" />
        {label && <span className="frame-label">{label}</span>}
      </div>
    )}
    {children}
  </div>
);

export default MediaFrame;
