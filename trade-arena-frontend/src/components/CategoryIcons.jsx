import * as MdIcons from 'react-icons/md'

export default function CategoryIcon({ iconName, size = 16, color }) {
    if (!iconName) return null
    const Icon = MdIcons[iconName]
    if (!Icon) return null
    return <Icon size={size} color={color} />
}