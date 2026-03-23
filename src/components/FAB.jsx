export default function FAB({ icon = 'add', onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-32 right-6 w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 to-purple-400 shadow-xl shadow-purple-500/30 flex items-center justify-center active:scale-90 transition-all z-40 ${className}`}
    >
      <span className="material-symbols-outlined text-white" style={{ fontSize: '26px' }}>
        {icon}
      </span>
    </button>
  )
}
