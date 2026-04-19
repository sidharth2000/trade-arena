import { useState, useEffect } from 'react'
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import InputBase from '@mui/material/InputBase'
import SearchIcon from '@mui/icons-material/Search'
import styles from './CategoryConfiguration.module.css'
import { categoryApi } from '../../api/categoryApi'
import CategoryIcon from '../../components/CategoryIcons'
import Button from '@mui/material/Button'
import AddIcon from '@mui/icons-material/Add'
import AddCategoryModal from './AddCategoryModal'

const typeLabel = (type) => ({
    text: 'Short text',
    textarea: 'Long text',
    number: 'Number',
    choice: 'Choice',
    date: 'Date',
}[type] || type)

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
    const [openAddCategory, setOpenAddCategory] = useState(false)

    useEffect(() => {
        setLoadingCats(true)
        categoryApi.getAllCategories()
            .then(res => setCategories(
                res.payload.categories.map(c => ({
                    id: c.categoryId,
                    name: c.categoryName,
                    icon: c.categoryIcon
                }))
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
                res.payload.subCategories.map(s => ({
                    id: s.categoryId,
                    name: s.categoryName,
                    icon: s.categoryIcon
                }))
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
        CHOICE: 'choice',
        DATE: 'date',
    }[responseType] || 'text')

    const filteredCats = categories.filter(c =>
        c.name.toLowerCase().includes(catSearch.toLowerCase())
    )

    const filteredSubs = subcategories.filter(s =>
        s.name.toLowerCase().includes(subSearch.toLowerCase())
    )

    return (
        <Box
            className={styles.page}
            sx={{ background: p.background.default, color: p.text.primary }}
        >
            {/* Header */}
            <Box className={styles.pageHeader}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Category Configuration
                </Typography>
                <Typography variant="body2" sx={{ color: p.text.secondary }}>
                    View categories, subcategories and their listing form questions
                </Typography>
            </Box>
            <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setOpenAddCategory(true)}
    >
        Add New Category
    </Button>

            

            {/* Panels */}
            <Box
                className={styles.panels}
                sx={{ border: `1px solid ${p.divider}`, background: p.background.paper }}
            >

                {/* Category Panel */}
                <Box className={styles.panel} sx={{ borderRight: `1px solid ${p.divider}` }}>
                    <Box className={styles.panelHeader}>
                        <Typography className={styles.panelTitle}>
                            Category
                        </Typography>
                    </Box>

                    <Box className={styles.searchRow}>
                        <SearchIcon sx={{ fontSize: 15 }} />
                        <InputBase
                            placeholder="Search..."
                            value={catSearch}
                            onChange={e => setCatSearch(e.target.value)}
                            sx={{ fontSize: '13px', flex: 1 }}
                        />
                    </Box>

                    <Box className={styles.listScroll}>
                        {loadingCats ? (
                            <Typography className={styles.hint}>Loading...</Typography>
                        ) : filteredCats.map(cat => (
                            <Box
                                key={cat.id}
                                onClick={() => handleSelectCategory(cat)}
                                className={`${styles.listItem} ${selectedCat?.id === cat.id ? styles.listItemActive : ''}`}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <CategoryIcon iconName={cat.icon} size={16} />
                                    <span>{cat.name}</span>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* Subcategory Panel */}
                <Box className={styles.panel} sx={{ borderRight: `1px solid ${p.divider}` }}>
                    <Box className={styles.panelHeader}>
                        <Typography className={styles.panelTitle}>
                            Subcategory
                        </Typography>
                    </Box>

                    <Box className={styles.searchRow}>
                        <SearchIcon sx={{ fontSize: 15 }} />
                        <InputBase
                            placeholder="Search..."
                            value={subSearch}
                            onChange={e => setSubSearch(e.target.value)}
                            sx={{ fontSize: '13px', flex: 1 }}
                        />
                    </Box>

                    <Box className={styles.listScroll}>
                        {!selectedCat ? (
                            <Typography className={styles.hint}>Select a category</Typography>
                        ) : loadingSubs ? (
                            <Typography className={styles.hint}>Loading...</Typography>
                        ) : filteredSubs.map(sub => (
                            <Box
                                key={sub.id}
                                onClick={() => handleSelectSub(sub)}
                                className={`${styles.listItem} ${selectedSub?.id === sub.id ? styles.listItemActive : ''}`}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <CategoryIcon iconName={sub.icon} size={16} />
                                    <span>{sub.name}</span>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* Questions Panel */}
                <Box className={styles.panel3}>
                    <Box className={styles.panel3Header}>
                        <Box>
                            <Typography sx={{ fontWeight: 500 }}>
                                {selectedSub ? selectedSub.name : 'Select a subcategory'}
                            </Typography>
                            <Typography sx={{ fontSize: '11px', color: p.text.secondary }}>
                                {selectedSub
                                    ? `${selectedCat.name} › ${selectedSub.name} · ${questions.length} question${questions.length !== 1 ? 's' : ''}`
                                    : 'Questions will appear here'}
                            </Typography>
                        </Box>
                    </Box>

                    <Box className={styles.questionList}>
                        {!selectedSub ? (
                            <Box className={styles.emptyState}>
                                <Typography>☰</Typography>
                                <Typography>No subcategory selected</Typography>
                            </Box>
                        ) : loadingQuestions ? (
                            <Typography sx={{ textAlign: 'center', mt: '40px' }}>
                                Loading questions...
                            </Typography>
                        ) : questions.length === 0 ? (
                            <Box className={styles.emptyState}>
                                <Typography>—</Typography>
                                <Typography>No questions available</Typography>
                            </Box>
                        ) : questions.map((q, i) => (
                            <Box key={q.id} className={styles.questionCard}>
                                <Box className={styles.questionTop}>
                                    <Typography className={styles.questionNum}>
                                        {i + 1}.
                                    </Typography>

                                    <Box className={styles.questionBody}>
                                        <Typography sx={{ fontWeight: 500 }}>
                                            {q.label}
                                            {q.required && <span style={{ marginLeft: 4 }}>*</span>}
                                        </Typography>

                                        <Box className={styles.typeBadge}>
                                            {typeLabel(q.type)}
                                        </Box>

                                        {q.options?.length > 0 && (
                                            <Box className={styles.optionPills}>
                                                {q.options.map((opt, oi) => (
                                                    <Box key={oi} className={styles.pill}>
                                                        {opt}
                                                    </Box>
                                                ))}
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>
            <AddCategoryModal
    open={openAddCategory}
    handleClose={() => setOpenAddCategory(false)}
/>
        </Box>
    )
}