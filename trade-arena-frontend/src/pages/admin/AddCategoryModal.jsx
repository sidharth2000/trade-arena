import { useState } from 'react'
import * as MdIcons from 'react-icons/md'
import {
    Box,
    Modal,
    Typography,
    TextField,
    Button,
    Select,
    MenuItem,
    IconButton,
    Checkbox,
    FormControlLabel,
    Autocomplete,
    InputAdornment,
    Paper,
    Divider
} from '@mui/material'
import { Add, Delete } from '@mui/icons-material'

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '85vw',
    height: '90vh',
    bgcolor: '#f7f8fa',
    borderRadius: '16px',
    boxShadow: 24,
    p: 3,
    overflowY: 'auto'
}

// 🔹 build icon list once
const iconOptions = Object.keys(MdIcons).map((key) => ({
    label: key,
    value: key,
    Icon: MdIcons[key]
}))

export default function AddCategoryModal({ open, handleClose }) {

    const [form, setForm] = useState({
        categoryName: '',
        categoryIcon: '',
        subCategoryName: '',
        subCategoryIcon: '',
        questions: []
    })

    const addQuestion = () => {
        setForm(prev => ({
            ...prev,
            questions: [
                ...prev.questions,
                {
                    question: '',
                    responseType: 'TEXT',
                    required: false,
                    options: [],
                    placeholder: ''
                }
            ]
        }))
    }

    const updateQuestion = (index, key, value) => {
        const updated = [...form.questions]
        updated[index][key] = value
        setForm({ ...form, questions: updated })
    }

    const addOption = (qIndex) => {
        const updated = [...form.questions]
        updated[qIndex].options.push('')
        setForm({ ...form, questions: updated })
    }

    const updateOption = (qIndex, optIndex, value) => {
        const updated = [...form.questions]
        updated[qIndex].options[optIndex] = value
        setForm({ ...form, questions: updated })
    }

    const deleteQuestion = (index) => {
        const updated = form.questions.filter((_, i) => i !== index)
        setForm({ ...form, questions: updated })
    }

    const handleSubmit = async () => {
        console.log("Payload:", form)

        await fetch('http://localhost:8080/admin/savecategoryconfig', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
        })

        handleClose()
    }

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={style}>

                {/* HEADER */}
                <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
                    Create Category Configuration
                </Typography>

                <Divider sx={{ mb: 3 }} />

                {/* CATEGORY SECTION */}
                <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
                    <Typography fontWeight={600} sx={{ mb: 1 }}>
                        Category
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            fullWidth
                            label="Category Name"
                            value={form.categoryName}
                            onChange={(e) => setForm({ ...form, categoryName: e.target.value })}
                        />

                        <Autocomplete
                            options={iconOptions}
                            value={iconOptions.find(i => i.value === form.categoryIcon) || null}
                            onChange={(_, newValue) =>
                                setForm({ ...form, categoryIcon: newValue?.value || '' })
                            }
                            getOptionLabel={(opt) => opt.label}
                            renderOption={(props, option) => (
                                <li {...props}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <option.Icon size={18} />
                                        {option.label}
                                    </Box>
                                </li>
                            )}
                            renderInput={(params) => (
                                <TextField {...params} label="Category Icon" />
                            )}
                            sx={{ width: 300 }}
                        />
                    </Box>
                </Paper>

                {/* SUBCATEGORY */}
                <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
                    <Typography fontWeight={600} sx={{ mb: 1 }}>
                        Sub Category
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            fullWidth
                            label="Sub Category Name"
                            value={form.subCategoryName}
                            onChange={(e) => setForm({ ...form, subCategoryName: e.target.value })}
                        />

                        <Autocomplete
                            options={iconOptions}
                            value={iconOptions.find(i => i.value === form.subCategoryIcon) || null}
                            onChange={(_, newValue) =>
                                setForm({ ...form, subCategoryIcon: newValue?.value || '' })
                            }
                            getOptionLabel={(opt) => opt.label}
                            renderOption={(props, option) => (
                                <li {...props}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <option.Icon size={18} />
                                        {option.label}
                                    </Box>
                                </li>
                            )}
                            renderInput={(params) => (
                                <TextField {...params} label="Sub Category Icon" />
                            )}
                            sx={{ width: 300 }}
                        />
                    </Box>
                </Paper>

                {/* QUESTIONS */}
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Questions
                </Typography>

                {form.questions.map((q, index) => (
                    <Paper key={index} sx={{ p: 2, mb: 2, borderRadius: 3 }}>

                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <TextField
                                fullWidth
                                label="Question"
                                value={q.question}
                                onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                            />

                            <Select
                                value={q.responseType}
                                onChange={(e) => updateQuestion(index, 'responseType', e.target.value)}
                                sx={{ width: 140 }}
                            >
                                <MenuItem value="TEXT">TEXT</MenuItem>
                                <MenuItem value="NUMBER">NUMBER</MenuItem>
                                <MenuItem value="CHOICE">CHOICE</MenuItem>
                            </Select>

                            <IconButton onClick={() => deleteQuestion(index)} color="error">
                                <Delete />
                            </IconButton>
                        </Box>

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={q.required}
                                    onChange={(e) => updateQuestion(index, 'required', e.target.checked)}
                                />
                            }
                            label="Required"
                        />

                        {(q.responseType === 'TEXT' || q.responseType === 'NUMBER') && (
                            <TextField
                                fullWidth
                                label="Placeholder"
                                value={q.placeholder}
                                onChange={(e) => updateQuestion(index, 'placeholder', e.target.value)}
                                sx={{ mt: 2 }}
                            />
                        )}

                        {q.responseType === 'CHOICE' && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="body2" fontWeight={600}>
                                    Options
                                </Typography>

                                {q.options.map((opt, i) => (
                                    <TextField
                                        key={i}
                                        fullWidth
                                        size="small"
                                        value={opt}
                                        onChange={(e) => updateOption(index, i, e.target.value)}
                                        sx={{ mt: 1 }}
                                    />
                                ))}

                                <Button
                                    startIcon={<Add />}
                                    onClick={() => addOption(index)}
                                    sx={{ mt: 1 }}
                                >
                                    Add Option
                                </Button>
                            </Box>
                        )}
                    </Paper>
                ))}

                <Button startIcon={<Add />} onClick={addQuestion} sx={{ mb: 3 }}>
                    Add Question
                </Button>

                {/* ACTIONS */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button variant="contained" size="large" onClick={handleSubmit}>
                        Save Configuration
                    </Button>
                </Box>

            </Box>
        </Modal>
    )
}