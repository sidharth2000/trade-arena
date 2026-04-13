import { useState, useEffect } from 'react'
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import InputBase from '@mui/material/InputBase'
import Modal from '@mui/material/Modal'
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SearchIcon from '@mui/icons-material/Search'
import styles from './CategoryConfiguration.module.css'
import { categoryApi } from '../../api/categoryApi'
import CategoryIcon from '../../components/CategoryIcons'

const typeLabel = (type) => ({
    text: 'Short text', textarea: 'Long text', number: 'Number',
    dropdown: 'Dropdown', radio: 'Multiple choice', checkbox: 'Checkboxes',
    date: 'Date', file: 'File upload',
}[type] || type)

const emptyQuestion = { label: '', type: 'text', options: [], required: false }

export default function CategoryConfiguration() {
    const theme = useTheme()
    const p = theme.palette

    const [categories, setCategories] = useState([])
    const [subcategories, setSubcategories] = useState([])
    const [questions, setQuestions] = useState([])
    const [selectedCat, setSelectedCat] = useState(null)
    const [selectedSub, setSelectedSub] = useState(null)
    const [catSearch, setCatSearch] = useState('')
    const [subSearch, setSubSearch] = useState('')
    const [loadingCats, setLoadingCats] = useState(false)
    const [loadingSubs, setLoadingSubs] = useState(false)
    const [loadingQuestions, setLoadingQuestions] = useState(false)
    const [modalOpen, setModalOpen] = useState(false)
    const [editIndex, setEditIndex] = useState(null)
    const [form, setForm] = useState(emptyQuestion)
    const [optionsInput, setOptionsInput] = useState('')

    useEffect(() => {
        // setLoadingCats(true)
        categoryApi.getAllCategories()
            .then(res => setCategories(
                res.payload.categories.map(c => ({ id: c.categoryId, name: c.categoryName, icon: c.categoryIcon }))
            ))
            .finally(() => setLoadingCats(false))
    }, [])

    const handleSelectCategory = async (cat) => {
        setSelectedCat(cat)
        setSelectedSub(null)
        setQuestions([])
        setLoadingSubs(true)
        try {
            const res = await categoryApi.getSubCategories(cat.id)
            setSubcategories(
                res.payload.subCategories.map(s => ({ id: s.categoryId, name: s.categoryName, icon: s.categoryIcon }))
            )
        } finally {
            setLoadingSubs(false)
        }
    }

    const handleSelectSub = async (sub) => {
        setSelectedSub(sub)
        setLoadingQuestions(true)
        try {
            const res = await categoryApi.getQuestionsBySubCategory(sub.id)
            setQuestions(
                res.payload.questions.map(q => ({
                    id: q.formId,
                    label: q.question,
                    type: mapResponseType(q.responseType),
                    options: q.options || [],
                    required: q.required,
                    placeholder: q.placeholder,
                }))
            )
        } finally {
            setLoadingQuestions(false)
        }
    }

    const mapResponseType = (responseType) => ({
        TEXT: 'text',
        TEXT_AREA: 'textarea',
        NUMBER: 'number',
        CHOICE: 'dropdown',
        DATE: 'date',
    }[responseType] || 'text')

    const openAddModal = () => {
        setEditIndex(null)
        setForm(emptyQuestion)
        setOptionsInput('')
        setModalOpen(true)
    }

    const openEditModal = (index) => {
        const q = questions[index]
        setEditIndex(index)
        setForm({ label: q.label, type: q.type, options: q.options, required: q.required })
        setOptionsInput(q.options.join(', '))
        setModalOpen(true)
    }

    const closeModal = () => {
        setModalOpen(false)
        setEditIndex(null)
        setForm(emptyQuestion)
        setOptionsInput('')
    }

    const handleSave = () => {
        if (!form.label.trim()) return
        const opts = optionsInput.split(',').map(o => o.trim()).filter(Boolean)
        const question = { ...form, options: opts, id: Date.now() }
        if (editIndex !== null) {
            setQuestions(prev => prev.map((q, i) => i === editIndex ? question : q))
        } else {
            setQuestions(prev => [...prev, question])
        }
        closeModal()
    }

    const handleDelete = (index) => {
        setQuestions(prev => prev.filter((_, i) => i !== index))
    }

    const needsOptions = ['dropdown', 'radio', 'checkbox'].includes(form.type)
    const filteredCats = categories.filter(c => c.name.toLowerCase().includes(catSearch.toLowerCase()))
    const filteredSubs = subcategories.filter(s => s.name.toLowerCase().includes(subSearch.toLowerCase()))

    return (
        <Box
            className={styles.page}
            sx={{ background: p.background.default, color: p.text.primary }}
        >
            {/* Page title */}
            <Box className={styles.pageHeader}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: p.text.primary }}>
                    Category Configuration
                </Typography>
                <Typography variant="body2" sx={{ color: p.text.secondary, mt: '2px' }}>
                    Manage categories, subcategories and their listing form questions
                </Typography>
            </Box>

            {/* 3 panel layout */}
            <Box
                className={styles.panels}
                sx={{ border: `1px solid ${p.divider}`, background: p.background.paper }}
            >

                {/* Panel 1 - Category */}
                <Box
                    className={styles.panel}
                    sx={{ borderRight: `1px solid ${p.divider}` }}
                >
                    <Box
                        className={styles.panelHeader}
                        sx={{ background: p.custom.accentLight, borderBottom: `1px solid ${p.divider}` }}
                    >
                        <Typography className={styles.panelTitle} sx={{ color: p.text.secondary }}>
                            Category
                        </Typography>
                    </Box>
                    <Box
                        className={styles.searchRow}
                        sx={{ borderBottom: `1px solid ${p.divider}`, background: p.background.paper }}
                    >
                        <SearchIcon sx={{ fontSize: 15, color: p.custom.muted }} />
                        <InputBase
                            placeholder="Search..."
                            value={catSearch}
                            onChange={e => setCatSearch(e.target.value)}
                            sx={{ fontSize: '13px', flex: 1, color: p.text.primary }}
                        />
                    </Box>
                    <Box className={styles.listScroll}>
                        {loadingCats ? (
                            <Typography className={styles.hint} sx={{ color: p.custom.muted }}>Loading...</Typography>
                        ) : filteredCats.map(cat => (
                            <Box
                                key={cat.id}
                                onClick={() => handleSelectCategory(cat)}
                                className={`${styles.listItem} ${selectedCat?.id === cat.id ? styles.listItemActive : ''}`}
                                sx={{
                                    borderBottom: `1px solid ${p.divider}`,
                                    color: selectedCat?.id === cat.id ? p.primary.main : p.text.primary,
                                    background: selectedCat?.id === cat.id ? p.custom.accentLight : 'transparent',
                                    '&:hover': { background: p.custom.accentLight },
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <CategoryIcon
                                        iconName={cat.icon}
                                        size={16}
                                        color={selectedCat?.id === cat.id ? p.primary.main : p.text.secondary}
                                    />
                                    <span>{cat.name}</span>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* Panel 2 - Subcategory */}
                <Box
                    className={styles.panel}
                    sx={{ borderRight: `1px solid ${p.divider}` }}
                >
                    <Box
                        className={styles.panelHeader}
                        sx={{ background: p.custom.accentLight, borderBottom: `1px solid ${p.divider}` }}
                    >
                        <Typography className={styles.panelTitle} sx={{ color: p.text.secondary }}>
                            Subcategory
                        </Typography>
                    </Box>
                    <Box
                        className={styles.searchRow}
                        sx={{ borderBottom: `1px solid ${p.divider}`, background: p.background.paper }}
                    >
                        <SearchIcon sx={{ fontSize: 15, color: p.custom.muted }} />
                        <InputBase
                            placeholder="Search..."
                            value={subSearch}
                            onChange={e => setSubSearch(e.target.value)}
                            sx={{ fontSize: '13px', flex: 1, color: p.text.primary }}
                        />
                    </Box>
                    <Box className={styles.listScroll}>
                        {!selectedCat ? (
                            <Typography className={styles.hint} sx={{ color: p.custom.muted }}>Select a category</Typography>
                        ) : loadingSubs ? (
                            <Typography className={styles.hint} sx={{ color: p.custom.muted }}>Loading...</Typography>
                        ) : filteredSubs.map(sub => (
                            <Box
                                key={sub.id}
                                onClick={() => handleSelectSub(sub)}
                                className={`${styles.listItem} ${selectedSub?.id === sub.id ? styles.listItemActive : ''}`}
                                sx={{
                                    borderBottom: `1px solid ${p.divider}`,
                                    color: selectedSub?.id === sub.id ? p.primary.main : p.text.primary,
                                    background: selectedSub?.id === sub.id ? p.custom.accentLight : 'transparent',
                                    '&:hover': { background: p.custom.accentLight },
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <CategoryIcon
                                        iconName={sub.icon}
                                        size={16}
                                        color={selectedSub?.id === sub.id ? p.primary.main : p.text.secondary}
                                    />
                                    <span>{sub.name}</span>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* Panel 3 - Form questions */}
                <Box className={styles.panel3}>
                    <Box
                        className={styles.panel3Header}
                        sx={{ background: p.custom.accentLight, borderBottom: `1px solid ${p.divider}` }}
                    >
                        <Box>
                            <Typography sx={{ fontSize: '14px', fontWeight: 500, color: p.text.primary }}>
                                {selectedSub ? selectedSub.name : 'Select a subcategory'}
                            </Typography>
                            <Typography sx={{ fontSize: '11px', color: p.custom.muted, mt: '1px' }}>
                                {selectedSub
                                    ? `${selectedCat.name} › ${selectedSub.name} · ${questions.length} question${questions.length !== 1 ? 's' : ''}`
                                    : 'Questions will appear here'}
                            </Typography>
                        </Box>
                        {selectedSub && (
                            <Button
                                onClick={openAddModal}
                                variant="contained"
                                size="small"
                                sx={{
                                    fontSize: '13px',
                                    background: p.primary.main,
                                    textTransform: 'none',
                                    borderRadius: '6px',
                                    boxShadow: 'none',
                                    '&:hover': { boxShadow: 'none', opacity: 0.9 }
                                }}
                            >
                                + Add question
                            </Button>
                        )}
                    </Box>

                    {/* Questions list */}
                    <Box
                        className={styles.questionList}
                        sx={{ background: p.background.default }}
                    >
                        {!selectedSub ? (
                            <Box className={styles.emptyState}>
                                <Typography sx={{ fontSize: '28px' }}>☰</Typography>
                                <Typography sx={{ fontSize: '13px', color: p.custom.muted }}>No subcategory selected</Typography>
                            </Box>
                        ) : loadingQuestions ? (
                            <Typography sx={{ textAlign: 'center', fontSize: '13px', color: p.custom.muted, mt: '40px' }}>
                                Loading questions...
                            </Typography>
                        ) : questions.length === 0 ? (
                            <Box className={styles.emptyState}>
                                <Typography sx={{ fontSize: '28px' }}>+</Typography>
                                <Typography sx={{ fontSize: '13px', color: p.custom.muted }}>No questions yet — add your first</Typography>
                            </Box>
                        ) : questions.map((q, i) => (
                            <Box
                                key={q.id}
                                className={styles.questionCard}
                                sx={{ background: p.background.paper, border: `1px solid ${p.divider}` }}
                            >
                                <Box className={styles.questionTop}>
                                    <Typography className={styles.questionNum} sx={{ color: p.custom.muted }}>
                                        {i + 1}.
                                    </Typography>
                                    <Box className={styles.questionBody}>
                                        <Typography sx={{ fontSize: '14px', fontWeight: 500, color: p.text.primary, mb: '4px' }}>
                                            {q.label}
                                            {q.required && (
                                                <span style={{ fontSize: '11px', color: p.custom.yellow, marginLeft: '4px' }}>*</span>
                                            )}
                                        </Typography>
                                        <Box
                                            className={styles.typeBadge}
                                            sx={{ background: p.custom.accentLight, color: p.text.secondary, border: `1px solid ${p.divider}` }}
                                        >
                                            {typeLabel(q.type)}
                                        </Box>
                                        {q.options?.length > 0 && (
                                            <Box className={styles.optionPills}>
                                                {q.options.map((opt, oi) => (
                                                    <Box
                                                        key={oi}
                                                        className={styles.pill}
                                                        sx={{ background: p.custom.accentLight, color: p.text.secondary, border: `1px solid ${p.divider}` }}
                                                    >
                                                        {opt}
                                                    </Box>
                                                ))}
                                            </Box>
                                        )}
                                    </Box>
                                    <Box className={styles.questionActions}>
                                        <EditIcon
                                            onClick={() => openEditModal(i)}
                                            className={styles.actionIcon}
                                            sx={{ color: p.text.secondary, '&:hover': { color: p.primary.main } }}
                                        />
                                        <DeleteIcon
                                            onClick={() => handleDelete(i)}
                                            className={styles.actionIcon}
                                            sx={{ color: p.text.secondary, '&:hover': { color: p.custom.red } }}
                                        />
                                    </Box>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>

            {/* Modal */}
            <Modal open={modalOpen} onClose={closeModal}>
                <Box
                    className={styles.modal}
                    sx={{ background: p.background.paper, border: `1px solid ${p.divider}` }}
                >
                    <Typography sx={{ fontSize: '15px', fontWeight: 600, color: p.text.primary, mb: '4px' }}>
                        {editIndex !== null ? 'Edit question' : 'Add question'}
                    </Typography>

                    <Box className={styles.fieldGroup}>
                        <Typography className={styles.fieldLabel} sx={{ color: p.text.secondary }}>Question label</Typography>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="e.g. What is the brand?"
                            value={form.label}
                            onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                        />
                    </Box>

                    <Box className={styles.fieldGroup}>
                        <Typography className={styles.fieldLabel} sx={{ color: p.text.secondary }}>Field type</Typography>
                        <Select
                            fullWidth
                            size="small"
                            value={form.type}
                            onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                        >
                            <MenuItem value="text">Short text</MenuItem>
                            <MenuItem value="textarea">Long text</MenuItem>
                            <MenuItem value="number">Number</MenuItem>
                            <MenuItem value="dropdown">Dropdown</MenuItem>
                            <MenuItem value="radio">Multiple choice</MenuItem>
                            <MenuItem value="checkbox">Checkboxes</MenuItem>
                            <MenuItem value="date">Date</MenuItem>
                            <MenuItem value="file">File upload</MenuItem>
                        </Select>
                    </Box>

                    {needsOptions && (
                        <Box className={styles.fieldGroup}>
                            <Typography className={styles.fieldLabel} sx={{ color: p.text.secondary }}>Options (comma separated)</Typography>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="e.g. New, Used, Refurbished"
                                value={optionsInput}
                                onChange={e => setOptionsInput(e.target.value)}
                            />
                        </Box>
                    )}

                    <FormControlLabel
                        control={
                            <Checkbox
                                size="small"
                                checked={form.required}
                                onChange={e => setForm(f => ({ ...f, required: e.target.checked }))}
                                sx={{ color: p.primary.main }}
                            />
                        }
                        label={<Typography sx={{ fontSize: '13px', color: p.text.primary }}>Required field</Typography>}
                    />

                    <Box className={styles.modalActions}>
                        <Button
                            onClick={closeModal}
                            variant="outlined"
                            size="small"
                            sx={{ textTransform: 'none', fontSize: '13px', borderColor: p.divider, color: p.text.secondary }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            variant="contained"
                            size="small"
                            sx={{ textTransform: 'none', fontSize: '13px', background: p.primary.main, boxShadow: 'none' }}
                        >
                            Save
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </Box>
    )
}