import React, { useState, useEffect } from "react"; // 引入 React 和 useState, useEffect
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Chip,
  Dialog,
  Avatar,
  Autocomplete,
} from "@mui/material"; // 引入 MUI 组件
import ReactQuill from "react-quill"; // 引入 ReactQuill
import "react-quill/dist/quill.snow.css"; // 引入 ReactQuill 样式
import "./QuillEditor.css"; // 确保正确引入自定义的 CSS 文件
import { Close, AddPhotoAlternate, Image } from "@mui/icons-material"; // 引入 MUI 图标
import axiosInstance from "../utils/axiosInstance"; // 引入 axiosInstance
import { useTranslation } from "react-i18next";

const PostEditor = ({ onSubmit, onClose }) => {
  const [title, setTitle] = useState(""); // 帖子标题
  const [content, setContent] = useState(""); // 帖子内容
  const [previewText, setPreviewText] = useState(""); // 预览文本
  const [coverImage, setCoverImage] = useState(null); // 封面图片
  const [coverImagePreview, setCoverImagePreview] = useState(null); // 封面图片预览
  const [isPreviewOpen, setIsPreviewOpen] = useState(false); // 是否打开预览对话框
  const [selectedTags, setSelectedTags] = useState([]); // 已选标签
  const [availableTags, setAvailableTags] = useState([]); // 可用
  const [inputValue, setInputValue] = useState(""); // 输入值
  const [newTags, setNewTags] = useState([]); // 新标签
  const { t } = useTranslation();

  // 获取可用标签
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await axiosInstance.get("/tags"); // 从后端获取标签
        setAvailableTags(response.data); // 设置可用标签
      } catch (error) {
        console.error("获取标签失败:", error); // 错误处理
      }
    };
    fetchTags(); // 调用获取标签的函数
  }, []);

  // 处理内容变化
  const handleChange = (value) => {
    setContent(value); // 设置内容
    const plainText = value.replace(/<[^>]+>/g, ""); // 除 HTML 标签
    setPreviewText(plainText.substring(0, 200)); // 设置预览文本
  };

  // 处理封面图片变化
  const handleCoverImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      // 检查是否有文件
      const file = event.target.files[0]; // 获取文件
      setCoverImage(file); // 设置封面图片
      setCoverImagePreview(URL.createObjectURL(file)); // 创建预览 URL
    }
  };

  // 处理标签输入
  const handleTagInput = (event, newInputValue) => {
    setInputValue(newInputValue); // 设置输入值
  };

  // 处理标签变化
  const handleTagChange = (event, newValue) => {
    const lastTag = newValue[newValue.length - 1]; // 获取最后一个标签
    if (
      typeof lastTag === "string" &&
      lastTag.startsWith("#") &&
      lastTag.length > 1
    ) {
      // 检查标签是否有效
      const tagName = lastTag.slice(1).trim(); // 获取标签名称
      if (
        tagName &&
        !availableTags.includes(tagName) &&
        !selectedTags.includes(`#${tagName}`)
      ) {
        // 检查标签是否有效
        setNewTags((prevNewTags) => [...prevNewTags, tagName]); // 添加新标签
        setSelectedTags((prevTags) => [...prevTags, `#${tagName}`]); // 添加到已选标签
      } else if (
        availableTags.includes(tagName) &&
        !selectedTags.includes(`#${tagName}`)
      ) {
        // 检查标签是否有
        setSelectedTags((prevTags) => [...prevTags, `#${tagName}`]); // 添加到已选标签
      }
    } else {
      setSelectedTags(
        newValue.filter((tag) => typeof tag === "string" && tag.startsWith("#"))
      ); // 过滤无效标签
    }
  };

  // 过滤标签
  const filterOptions = (options, { inputValue }) => {
    const filterValue = inputValue.startsWith("#")
      ? inputValue.slice(1).trim()
      : inputValue.trim(); // 获取过滤值
    return options
      .filter(
        (option) =>
          option.toLowerCase().includes(filterValue.toLowerCase()) &&
          !selectedTags.includes(option)
      )
      .slice(0, 5); // 返回过滤后的标签
  };

  // 删除标签
  const handleTagDelete = (tagToDelete) => {
    setSelectedTags((prevTags) =>
      prevTags.filter((tag) => tag !== tagToDelete)
    ); // 删除已选标签
    setNewTags((prevNewTags) =>
      prevNewTags.filter((tag) => `#${tag}` !== tagToDelete)
    ); // 删除新标签
  };

  // 提交帖子
  const handleSubmit = async () => {
    try {
      // 首先添加新标签
      for (const newTag of newTags) {
        await axiosInstance.post("/tags", { name: newTag }); // 添加新标签
      }

      const formData = new FormData(); // 创建 FormData 对象
      formData.append("title", title); // 添加标题
      formData.append("content", content); // 添加内容
      formData.append("previewText", previewText);
      if (coverImage) {
        formData.append("coverImage", coverImage); // 添加封面图片
      }
      // 去掉标签中的 '#' 后再发送给后端
      const tagsWithoutHash = selectedTags.map((tag) => tag.slice(1)); // 去掉标签中的 '#'
      formData.append("tags", JSON.stringify(tagsWithoutHash)); // 添加标签

      // 提交帖子
      await onSubmit(formData); // 提交帖子

      // 清空新标签列表
      setNewTags([]); // 清空新标签列表
    } catch (error) {
      console.error("发布帖子失:", error); // 错误处理
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      [{ script: "sub" }, { script: "super" }],
      [{ direction: "rtl" }],
      [{ size: ["small", false, "large", "huge"] }],
      [{ color: [] }, { background: [] }],
      [{ font: [] }],
      [{ align: [] }],
      ["link", "image", "video"],
      ["code-block", "formula"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "script",
    "direction",
    "size",
    "color",
    "background",
    "font",
    "align",
    "link",
    "image",
    "video",
    "code-block",
    "formula",
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "auto",
        maxHeight: "auto", // 移除最小高度限制
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{ position: "absolute", right: -16, top: -16, zIndex: 1 }}
      >
        <Close />
      </IconButton>
      <Typography variant="h5" gutterBottom id="post-editor-dialog-title">
        {t("publishNewPost")}
      </Typography>
      <TextField
        label={t("titlePlaceholder")}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        fullWidth
        variant="outlined"
        sx={{ mb: 2 }}
      />
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ mb: 1 }}>
          {t("tags")}
        </Typography>
        <Autocomplete
          multiple
          id="tags-filled"
          options={availableTags.map((tag) => `#${tag}`)}
          freeSolo
          value={selectedTags}
          onChange={handleTagChange}
          inputValue={inputValue}
          onInputChange={handleTagInput}
          filterOptions={filterOptions}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                key={option}
                label={option}
                onDelete={() => handleTagDelete(option)}
                {...getTagProps({ index })}
                sx={{ m: 0.5 }}
              />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              placeholder={t("enterTagPlaceholder")}
              sx={{
                "& .MuiOutlinedInput-root": {
                  padding: "8px",
                },
              }}
            />
          )}
          sx={{
            "& .MuiAutocomplete-endAdornment": {
              top: "auto",
              bottom: 8,
            },
          }}
        />
        <Typography
          variant="caption"
          color="textSecondary"
          sx={{ mt: 1, display: "block" }}
        >
          {t("tagInputInstruction")}
        </Typography>
      </Box>
      <Box sx={{ mb: 2, display: "flex", alignItems: "center" }}>
        <Button
          variant="outlined"
          component="label"
          startIcon={<AddPhotoAlternate />}
        >
          {t("uploadCoverImage")}
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleCoverImageChange}
          />
        </Button>
        {coverImagePreview && (
          <Chip
            avatar={<Avatar src={coverImagePreview} alt={t("coverPreview")} />}
            label={t("viewCoverImage")}
            onClick={() => setIsPreviewOpen(true)}
            sx={{ ml: 2, borderRadius: "16px" }}
          />
        )}
      </Box>
      <Box sx={{ mb: 2 }}>
        <ReactQuill
          value={content}
          onChange={handleChange}
          modules={modules}
          formats={formats}
          className="quill-editor" // 使用自定义的 CSS 类
          style={{
            height: "auto",
            minHeight: "200px",
            maxHeight: "calc(100% - 50px)",
          }}
        />
      </Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button onClick={onClose} sx={{ mr: 1 }}>
          {t("cancel")}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            backgroundColor: "#ed6000",
            "&:hover": {
              backgroundColor: "#ff7f50",
            },
          }}
        >
          {t("publishPost")}
        </Button>
      </Box>

      <Dialog
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <Box sx={{ position: "relative", p: 2 }}>
          <IconButton
            onClick={() => setIsPreviewOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
          <img
            src={coverImagePreview}
            alt="封面图片预览"
            style={{
              width: "100%",
              height: "auto",
              maxHeight: "80vh",
              objectFit: "contain",
            }}
          />
        </Box>
      </Dialog>
    </Box>
  );
};

export default PostEditor;
