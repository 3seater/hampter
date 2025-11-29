import './HamsterPicker.css'
import { hamsterImages } from '../utils/hamsterImages'

interface HamsterPickerProps {
  onSelect: (imageUrl: string) => void
  onClose: () => void
}

const HamsterPicker = ({ onSelect, onClose }: HamsterPickerProps) => {

  const handleSelect = (imageUrl: string) => {
    onSelect(imageUrl)
    onClose()
  }

  return (
    <div className="hamster-picker-overlay" onClick={onClose}>
      <div className="hamster-picker" onClick={(e) => e.stopPropagation()}>
        <div className="picker-header">
          <h3>Choose a hamster</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="hamster-grid">
          {hamsterImages.map((hamster) => (
            <div
              key={hamster.id}
              className="hamster-item"
              onClick={() => handleSelect(hamster.url)}
            >
              <img src={hamster.url} alt={hamster.name} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HamsterPicker
