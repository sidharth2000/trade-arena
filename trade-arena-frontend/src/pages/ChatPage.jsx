import { useState, useEffect, useRef } from 'react'
import {
  Box, Typography, TextField, IconButton, Avatar,
  InputAdornment, CircularProgress, Divider
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { Search, Send, MessageCircle } from 'lucide-react'
import { chatApi } from '../api/ChatApi'
import { useAuth } from '../hooks/useAuth'
import styles from './ChatPage.module.css'

function timeAgo(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return d.toLocaleDateString()
}

function formatTime(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ChatPage() {
  const theme = useTheme()
  const { user } = useAuth()
  const navBg = theme.palette.custom.nav

  const [conversations, setConversations] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingConvs, setLoadingConvs] = useState(false)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const bottomRef = useRef(null)

  // Load conversations
  useEffect(() => {
    if (!user?.id) return
    setLoadingConvs(true)
    chatApi.getConversations(user.id)
      .then((data) => setConversations(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoadingConvs(false))
  }, [user?.id])

  // Load messages when chat selected
  useEffect(() => {
    if (!selectedChat) return
    setLoadingMsgs(true)
    const chatId = selectedChat.chatId ?? selectedChat.id
    chatApi.getMessages(chatId)
      .then((data) => setMessages(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoadingMsgs(false))
  }, [selectedChat])

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!text.trim() || !selectedChat || !user?.id) return
    const payload = {
      chatId: selectedChat.chatId ?? selectedChat.id,
      senderId: user.id,
      content: text.trim(),
    }
    const optimistic = { ...payload, messageId: Date.now(), timestamp: new Date().toISOString(), senderId: user.id }
    setMessages((m) => [...m, optimistic])
    setText('')
    try {
      await chatApi.sendMessage(payload)
    } catch {
      // keep optimistic msg
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const filteredConvs = conversations.filter((c) => {
    const name = c.otherUserName ?? c.productTitle ?? ''
    return name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const isDark = theme.palette.mode === 'dark'
  const sidebarBg = isDark ? '#1a2340' : '#fff'
  const mainBg = isDark ? '#0f1624' : '#efeae2'
  const bubbleMe = navBg
  const bubbleOther = isDark ? '#1e2d4f' : '#fff'

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', background: mainBg, overflow: 'hidden' }}>

      {/* ── Left sidebar ── */}
      <Box sx={{ width: 360, flexShrink: 0, background: sidebarBg, borderRight: `1px solid ${theme.palette.divider}`, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ px: 2, py: 1.5, background: navBg, display: 'flex', alignItems: 'center', gap: 1 }}>
          <MessageCircle size={20} color="#fff" />
          <Typography variant="subtitle1" fontWeight={700} color="#fff">Chats</Typography>
        </Box>

        {/* Search */}
        <Box sx={{ px: 1.5, py: 1 }}>
          <TextField
            fullWidth size="small" placeholder="Search or start a chat"
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment>,
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 20, background: isDark ? '#162038' : '#f0f2f5', fontSize: 13 } }}
          />
        </Box>

        <Divider />

        {/* Conversation list */}
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {loadingConvs ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : filteredConvs.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <MessageCircle size={40} color="#ccc" />
              <Typography variant="body2" color="text.secondary" mt={1}>No conversations yet</Typography>
            </Box>
          ) : (
            filteredConvs.map((conv) => {
              const convId = conv.chatId ?? conv.id
              const isActive = (selectedChat?.chatId ?? selectedChat?.id) === convId
              const name = conv.otherUserName ?? conv.productTitle ?? 'Unknown'
              const lastMsg = conv.lastMessage ?? ''
              const initials = name.slice(0, 2).toUpperCase()

              return (
                <Box
                  key={convId}
                  onClick={() => setSelectedChat(conv)}
                  className={styles.convItem}
                  sx={{
                    background: isActive ? (isDark ? '#162038' : '#f0f2f5') : 'transparent',
                    '&:hover': { background: isDark ? '#162038' : '#f5f5f5' },
                  }}
                >
                  <Avatar sx={{ width: 48, height: 48, background: navBg, fontSize: 16, fontWeight: 700 }}>
                    {initials}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <Typography variant="body2" fontWeight={600} noWrap>{name}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0, ml: 1 }}>
                        {timeAgo(conv.lastMessageTime ?? conv.updatedAt)}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                      {lastMsg}
                    </Typography>
                  </Box>
                </Box>
              )
            })
          )}
        </Box>
      </Box>

      {/* ── Right — message area ── */}
      {selectedChat ? (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Chat header */}
          <Box sx={{ px: 2.5, py: 1.5, background: isDark ? '#1a2340' : '#fff', borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 42, height: 42, background: navBg, fontWeight: 700 }}>
              {(selectedChat.otherUserName ?? selectedChat.productTitle ?? 'U').slice(0, 2).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight={700}>
                {selectedChat.otherUserName ?? selectedChat.productTitle ?? 'Chat'}
              </Typography>
              {selectedChat.productTitle && (
                <Typography variant="caption" color="text.secondary">{selectedChat.productTitle}</Typography>
              )}
            </Box>
          </Box>

          {/* Messages */}
          <Box sx={{ flex: 1, overflowY: 'auto', px: 4, py: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {loadingMsgs ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
                <CircularProgress size={24} />
              </Box>
            ) : messages.length === 0 ? (
              <Box sx={{ textAlign: 'center', mt: 6 }}>
                <MessageCircle size={48} color="#ccc" />
                <Typography variant="body2" color="text.secondary" mt={1}>No messages yet. Say hello!</Typography>
              </Box>
            ) : (
              messages.map((msg, i) => {
                const isMe = String(msg.senderId) === String(user?.id)
                return (
                  <Box key={msg.messageId ?? msg.id ?? i}
                    sx={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                    <Box
                      className={styles.bubble}
                      sx={{
                        background: isMe ? bubbleMe : bubbleOther,
                        color: isMe ? '#fff' : theme.palette.text.primary,
                        borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      }}
                    >
                      <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                        {msg.content}
                      </Typography>
                      <Typography variant="caption"
                        sx={{ display: 'block', textAlign: 'right', opacity: 0.7, fontSize: 10, mt: 0.25 }}>
                        {formatTime(msg.timestamp ?? msg.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                )
              })
            )}
            <div ref={bottomRef} />
          </Box>

          {/* Input */}
          <Box sx={{ px: 2, py: 1.5, background: isDark ? '#1a2340' : '#fff', borderTop: `1px solid ${theme.palette.divider}`, display: 'flex', gap: 1, alignItems: 'flex-end' }}>
            <TextField
              fullWidth multiline maxRows={4} size="small" placeholder="Type a message"
              value={text} onChange={(e) => setText(e.target.value)} onKeyDown={handleKeyDown}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 24, fontSize: 14 } }}
            />
            <IconButton
              onClick={handleSend} disabled={!text.trim()}
              sx={{ width: 44, height: 44, background: navBg, color: '#fff',
                '&:hover': { background: '#1a5dc8' }, '&:disabled': { background: '#ccc' } }}
            >
              <Send size={18} />
            </IconButton>
          </Box>
        </Box>
      ) : (
        /* Empty state */
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <Box sx={{ width: 120, height: 120, borderRadius: '50%', background: `${navBg}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageCircle size={52} color={navBg} />
          </Box>
          <Typography variant="h6" fontWeight={600} color="text.secondary">TradeArena Chat</Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" maxWidth={320}>
            Select a conversation from the left to start chatting with buyers and sellers
          </Typography>
        </Box>
      )}
    </Box>
  )
}