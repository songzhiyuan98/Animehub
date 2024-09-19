import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Box, Typography, Avatar, LinearProgress, Card, CardContent, CardMedia, 
  Container, Button, TextField, CircularProgress, Grid, Chip, List, ListItem, ListItemButton, ListItemAvatar, ListItemText,
  Link, IconButton, Tooltip
} from '@mui/material';
import { ChatBubbleOutline, AccessTime } from '@mui/icons-material';
import axiosInstance from '../utils/axiosInstance';
import Comment from './Comment';
import { ThumbsUp } from 'lucide-react';
import LoginPromptDialog from './LoginPromptDialog'; // 导入 LoginPromptDialog 组件
import './PostDetail.css'; // 创建这个文件来存放文章内容的样式

const BASE_URL = 'http://localhost:3000';

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isCommentsLoading, setIsCommentsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const user = useSelector((state) => state.user.user);
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [similarPosts, setSimilarPosts] = useState([]);
  const [processedContent, setProcessedContent] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axiosInstance.get(`/posts/${id}`);
        setPost(response.data);
        setIsLiked(response.data.likes.includes(user?._id));
        setLikeCount(response.data.likes.length);
      } catch (error) {
        console.error('获取帖子详情失败:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, user]);

  useEffect(() => {
    const fetchComments = async () => {
      setIsCommentsLoading(true);
      try {
        const response = await axiosInstance.get(`/posts/${id}/comments`);
        setComments(response.data);
      } catch (error) {
        console.error('获取评论失败:', error);
      } finally {
        setIsCommentsLoading(false);
      }
    };
    fetchComments();
  }, [id]);

  useEffect(() => {
    const fetchSimilarPosts = async () => {
      try {
        const response = await axiosInstance.get(`/posts/${id}/similar`);
        setSimilarPosts(response.data);
      } catch (error) {
        console.error('获取相似帖子失败:', error);
      }
    };
    if (post) {
      fetchSimilarPosts();
    }
  }, [id, post]);

  useEffect(() => {
    const processContent = (content) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      
      // 处理图片
      doc.querySelectorAll('img').forEach(img => {
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
      });

      // 处理视频
      doc.querySelectorAll('iframe').forEach(iframe => {
        const wrapper = doc.createElement('div');
        wrapper.className = 'video-container';
        iframe.parentNode.insertBefore(wrapper, iframe);
        wrapper.appendChild(iframe);
      });

      return doc.body.innerHTML;
    };

    if (post) {
      setProcessedContent(processContent(post.content));
    }
  }, [post]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const response = await axiosInstance.post(`/posts/${id}/comments`, { content: newComment });
      setComments([...comments, response.data]);
      setNewComment("");
    } catch (error) {
      console.error('添加评论失败:', error);
    }
  };

  const handleReply = async (parentId, content) => {
    if (!content.trim()) return;
    try {
      const response = await axiosInstance.post(`/comments/${parentId}/reply`, { content });
      setComments(prevComments => updateReplies(prevComments, parentId, response.data));
    } catch (error) {
      console.error('回复评论失败:', error);
    }
  };

  const updateReplies = (comments, parentId, newReply) => {
    return comments.map(comment => {
      if (comment._id === parentId) {
        return { ...comment, replies: [...(comment.replies || []), newReply] };
      }
      return comment;
    });
  };

  const handleLike = async () => {
    console.log('handleLike 被调用');
    if (!isLoggedIn) {
      console.log('用户未登录');
      setLoginPromptOpen(true); // 打开登录提示对话框
      return;
    }
    try {
      console.log('发送点赞请求');
      const response = await axiosInstance.post(`/posts/${id}/like`);
      console.log('点赞响应:', response.data);
      setIsLiked(response.data.isLiked);
      setLikeCount(response.data.likes);
    } catch (error) {
      console.error('点赞失败:', error);
    }
  };

  const handleLoginPromptClose = () => {
    setLoginPromptOpen(false);
  };
  

  if (loading) {
    return (
      <Box sx={{ width: "100%", backgroundColor: "#F2F2F2", minHeight: "100vh" }}>
        <LinearProgress />
      </Box>
    );
  }

  if (!post) {
    return (
      <Box sx={{ backgroundColor: "#F2F2F2", minHeight: "100vh", color: "#333333" }}>
        <Container maxWidth={false} sx={{ marginTop: 2 }}>
          <Typography>帖子不存在或已被删除</Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: "#F2F2F2", minHeight: "100vh", color: "#333333" }}>
      <Container maxWidth={false} sx={{ mt: 2 }}>
      <Box sx={{ padding: 3 }}>
        <Grid container spacing={3}>
          {/* 左侧文章内容 */}
          <Grid item xs={12} md={9}>
            <Card sx={{ 
              borderRadius: "16px", 
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.08)",
              overflow: "hidden"
            }}>
              {post.coverImage && (
                <CardMedia
                  component="img"
                  sx={{ 
                    width: '100%',
                    height: 300,
                    objectFit: 'cover',
                  }}
                  image={`${BASE_URL}${post.coverImage}`}
                  alt={post.title}
                />
              )}
              <CardContent sx={{ padding: 4 }}>
                <Typography variant="h4" gutterBottom sx={{ 
                  fontWeight: 700, 
                  color: "#333",
                  mb: 3
                }}>
                  {post.title}
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 3,
                  pb: 2,
                  borderBottom: '1px solid #eaeaea'
                }}>
                  <Avatar 
                    src={post.author?.avatar ? `${BASE_URL}${post.author.avatar}` : undefined} 
                    sx={{ mr: 2, width: 48, height: 48 }} 
                  />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {post.author?.username}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      发布于 {new Date(post.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                    <Tooltip title={isLiked ? "取消点赞" : "点赞"}>
                      <IconButton onClick={handleLike} color={isLiked ? "primary" : "default"}>
                        <ThumbsUp />
                      </IconButton>
                    </Tooltip>
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {likeCount}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                    <div className="post-content" dangerouslySetInnerHTML={{ __html: processedContent }} />
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 3 }}>
                  {post.tags && post.tags.map((tag, index) => (
                    <Chip 
                      key={index} 
                      label={tag} 
                      variant="outlined" 
                      sx={{ 
                        borderRadius: '16px', 
                        backgroundColor: '#f0f0f0',
                        '&:hover': {
                          backgroundColor: '#e0e0e0',
                        }
                      }} 
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* 右侧作者信息和帖子统计 */}
          <Grid item xs={12} md={3} sx={{ top: 20, alignSelf: 'flex-start' }}>
            <Card sx={{ borderRadius: "16px", boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>作者信息</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    src={post.author?.avatar ? `${BASE_URL}${post.author.avatar}` : undefined} 
                    sx={{ width: 60, height: 60, mr: 2 }} 
                  />
                  <Box>
                    <Typography variant="subtitle1">{post.author?.username}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {/* 这里可以添加更多作者信息，如简介等 */}
                      作者简介
                    </Typography>
                  </Box>
                </Box>
                {/* 这里可以添加关注作者的按钮等 */}
              </CardContent>
            </Card>
            <Card sx={{ borderRadius: "16px", boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>帖子统计</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ThumbsUp size={20} />
                  <Typography variant="body2" sx={{ ml: 1 }}>{likeCount} 赞</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ChatBubbleOutline sx={{ fontSize: 20 }} />
                  <Typography variant="body2" sx={{ ml: 1 }}>{comments.length} 评论</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccessTime sx={{ fontSize: 20 }} />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {post.readTime ? `${post.readTime} 分钟阅读` : '未知'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
            <Card sx={{ borderRadius: "16px", boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>相关标签</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {post.tags && post.tags.map((tag) => (
                    <Chip key={tag} label={tag}/>
                  ))}
                </Box>
              </CardContent>
            </Card>
            <Card sx={{ borderRadius: "16px", boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>相似帖子</Typography>
                <List>
                  {similarPosts.map((similarPost) => (
                    <ListItem key={similarPost._id} disablePadding>
                      <ListItemButton component={Link} to={`/post/${similarPost._id}`}>
                        <ListItemAvatar>
                          <Avatar src={similarPost.author?.avatar ? `${BASE_URL}${similarPost.author.avatar}` : undefined} />
                        </ListItemAvatar>
                        <ListItemText 
                          primary={similarPost.title} 
                          secondary={`by ${similarPost.author?.username}`} 
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* 评论区 */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" gutterBottom>评论</Typography>
          <Box sx={{ minHeight: "20vh", display: "flex", flexDirection: "column" }}>
            {isLoggedIn ? (
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="写下你的评论..."
                />
                <Button onClick={handleAddComment} sx={{ mt: 1 }}>发表评论</Button>
              </Box>
            ) : null}
            {isCommentsLoading ? (
              <CircularProgress />
            ) : (
              comments.map((comment) => (
                <Comment
                  key={comment._id}
                  comment={comment}
                  onReply={handleReply}
                  currentUser={user}
                />
              ))
            )}
            {!isLoggedIn && (
              <Box sx={{ textAlign: "center", mt: "auto" }}>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  请登录后发表评论
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
        </Box>
      </Container>
      {/* 登录提示对话框 */}
      <LoginPromptDialog 
        open={loginPromptOpen} 
        handleClose={handleLoginPromptClose} 
      />
    </Box>
  );
};

export default PostDetail;
