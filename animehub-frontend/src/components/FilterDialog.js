//过滤弹窗组件
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Chip,
} from "@mui/material"; //导入必要弹窗组件

//弹窗组件接受以下参数
const FilterDialog = ({
  open,
  onClose,
  genres,
  types,
  statuses,
  ratings,
  orderBy,
  sortDirections,
  sfws,
  onApply,
  initialFilters,
  translateQuery,
}) => {
  const [filters, setFilters] = useState(initialFilters); //创建本地过滤状态filter，包含所有过滤条件的对象

  //处理类型切换的函数，如果该类型已经在过滤器状态中，移除该类型，如果不在，则添加
  const handleGenreToggle = (genreValue) => {
    setFilters((prev) => ({
      ...prev,
      genres: prev.genres.includes(genreValue)
        ? prev.genres.filter((value) => value !== genreValue)
        : [...prev.genres, genreValue],
    }));
  };

  const handleToggle = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: prev[field] === value ? "" : value,
    }));
  };

  //应用过滤器的函数，如果搜索输入为中文，则先翻译成英文
  const handleApply = async () => {
    let finalQuery = filters.query; //获取过滤器搜索输入
    if (containsChinese(filters.query)) {
      finalQuery = await translateQuery(filters.query); //如果搜索输入包含中文，调用翻译
    }
    onApply({ ...filters, query: finalQuery }); //调用参数中的应用过滤器函数
    onClose(); //调用参数中的关闭弹窗函数
  };

  // 检查字符串是否包含中文
  const containsChinese = (str) => {
    return /[\u4e00-\u9fa5]/.test(str);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      aria-labelledby="login-prompt-dialog-title"
      PaperProps={{
        sx: {
          borderRadius: "16px",
          boxShadow: "0px 4px 20px rgba(0,0,0,0.2)",
          padding: 3,
        },
      }}
    >
      <DialogTitle>过滤选项</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="搜索动漫"
          value={filters.query}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, query: e.target.value }))
          }
          margin="normal"
        />

        <Box sx={{ mt: 2 }}>
          <Box sx={{ fontWeight: "bold", mb: 1 }}>类型：</Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {types.map((type) => (
              <Chip
                key={type.value}
                label={type.label}
                onClick={() => handleToggle("type", type.value)}
                color={filters.type === type.value ? "primary" : "default"}
              />
            ))}
          </Box>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Box sx={{ fontWeight: "bold", mb: 1 }}>状态：</Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {statuses.map((status) => (
              <Chip
                key={status.value}
                label={status.label}
                onClick={() => handleToggle("status", status.value)}
                color={filters.status === status.value ? "primary" : "default"}
              />
            ))}
          </Box>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Box sx={{ fontWeight: "bold", mb: 1 }}>分级：</Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {ratings.map((rating) => (
              <Chip
                key={rating.value}
                label={rating.label}
                onClick={() => handleToggle("rating", rating.value)}
                color={filters.rating === rating.value ? "primary" : "default"}
              />
            ))}
          </Box>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Box sx={{ fontWeight: "bold", mb: 1 }}>限制成人内容：</Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {sfws.map((sfw) => (
              <Chip
                key={sfw.value}
                label={sfw.label}
                onClick={() => handleToggle("sfw", sfw.value)}
                color={filters.sfw === sfw.value ? "primary" : "default"}
              />
            ))}
          </Box>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Box sx={{ fontWeight: "bold", mb: 1 }}>类型：</Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {genres.map((genre) => (
              <Chip
                key={genre.value}
                label={genre.label}
                onClick={() => handleGenreToggle(genre.value)}
                color={
                  filters.genres.includes(genre.value) ? "primary" : "default"
                }
              />
            ))}
          </Box>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Box sx={{ fontWeight: "bold", mb: 1 }}>排序方式：</Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {orderBy.map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                onClick={() => handleToggle("order_by", option.value)}
                color={
                  filters.order_by === option.value ? "primary" : "default"
                }
              />
            ))}
          </Box>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Box sx={{ fontWeight: "bold", mb: 1 }}>排序方向：</Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {sortDirections.map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                onClick={() => handleToggle("sort", option.value)}
                color={filters.sort === option.value ? "primary" : "default"}
              />
            ))}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button onClick={handleApply} variant="contained" color="primary">
          应用过滤器
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FilterDialog;
