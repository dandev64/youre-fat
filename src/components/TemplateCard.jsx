import { useNavigate } from 'react-router-dom'
import { COLOR_MAP, CATEGORY_ICON } from '../data/seedTemplates'

export default function TemplateCard({ template, onUse }) {
  const navigate = useNavigate()
  const colors = COLOR_MAP[template.colorKey] ?? COLOR_MAP.purple
  const icon = CATEGORY_ICON[template.category] ?? 'fitness_center'

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-black/5 active:scale-[0.98] transition-all">
      {/* Gradient header */}
      <div
        className={`bg-gradient-to-br ${colors.grad} px-5 pt-5 pb-4 relative cursor-pointer`}
        onClick={() => navigate(`/templates/${template.id}`)}
      >
        {/* Background icon */}
        <span
          className="material-symbols-outlined text-white/15 absolute right-4 bottom-2"
          style={{ fontSize: '56px', fontVariationSettings: "'FILL' 1" }}
        >
          {icon}
        </span>

        <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${colors.badge}`}>
          {template.category}
        </span>

        <h3 className="font-headline font-extrabold text-white text-lg mt-3 leading-snug">
          {template.name}
        </h3>

        <div className="flex items-center gap-3 mt-1.5">
          {template.duration && template.duration !== '-' && (
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-white/60" style={{ fontSize: '12px' }}>
                schedule
              </span>
              <span className="text-white/70 text-[11px] font-medium">{template.duration}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-white/60" style={{ fontSize: '12px' }}>
              location_on
            </span>
            <span className="text-white/70 text-[11px] font-medium">{template.location}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        {/* Exercise preview list */}
        <div className="space-y-2 mb-4">
          {template.exercises.slice(0, 3).map((ex, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${colors.dot}`} />
              <p className="text-xs text-on-surface font-medium truncate flex-1">{ex.name}</p>
              <p className="text-[10px] text-on-surface-variant shrink-0">
                {ex.duration ?? `${ex.sets}×${ex.reps}`}
              </p>
            </div>
          ))}
          {template.exercises.length > 3 && (
            <p className="text-[10px] text-on-surface-variant/60 font-medium pl-3.5">
              +{template.exercises.length - 3} more exercises
            </p>
          )}
        </div>

        {/* Action row */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/templates/${template.id}`)}
            className="flex-1 py-2.5 rounded-2xl bg-surface-container text-on-surface-variant text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span>
            Edit
          </button>
          <button
            onClick={onUse}
            className={`flex-1 py-2.5 rounded-2xl bg-gradient-to-r ${colors.grad} text-white text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>
              add_circle
            </span>
            Use
          </button>
        </div>
      </div>
    </div>
  )
}
