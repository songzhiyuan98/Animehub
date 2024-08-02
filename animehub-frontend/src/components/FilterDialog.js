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
  open, //控制弹窗是否打开
  onClose, //控制弹窗关闭的函数
  genres, //动漫类型列表
  onApply, //应用过滤器的函数
  initialFilters, //初始过滤器状态
  translateQuery, //翻译查询的参数
}) => {
  const [filters, setFilters] = useState(initialFilters); //创建本地过滤状态filter，包含所有过滤条件的对象

  //处理类型切换的函数，如果该类型已经在过滤器状态中，移除该类型，如果不在，则添加
  const handleGenreToggle = (genreId) => {
    setFilters((prev) => ({
      ...prev,
      genres: prev.genres.includes(genreId) //如果该类型已经存在过滤器状态中
        ? prev.genres.filter((id) => id !== genreId) //执行删除该类型
        : [...prev.genres, genreId], //否则新增该类型
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
          value={filters.query} //将该输入框的值绑定filter对象的query属性
          onChange={
            (e) => setFilters((prev) => ({ ...prev, query: e.target.value })) //更新query属性
          }
          margin="normal"
        />
        <Box sx={{ mt: 2 }}>
          <Box sx={{ fontWeight: "bold", mb: 1 }}>类型：</Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {genres.map(
              (
                genre //根据传入的genre参数数组生成chip组件
              ) => (
                <Chip
                  key={genre.mal_id}
                  label={genre.name} //组件显示文字genre name属性
                  onClick={() => handleGenreToggle(genre.mal_id.toString())} //点击事件调用类型切换函数正确处理filter.genre属性变化
                  color={
                    filters.genres.includes(genre.mal_id.toString())
                      ? "primary"
                      : "default" //判断该类型是否被选中，被选中显示primary，未选中显示default
                  }
                />
              )
            )}
          </Box>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Box sx={{ fontWeight: "bold", mb: 1 }}>排序：</Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            <Chip
              label="默认"
              onClick={() => setFilters((prev) => ({ ...prev, sort: "" }))}
              color={filters.sort === "" ? "primary" : "default"}
            />
            <Chip
              label="人气"
              onClick={() =>
                setFilters((prev) => ({ ...prev, sort: "popularity" }))
              }
              color={filters.sort === "popularity" ? "primary" : "default"}
            />
            <Chip
              label="评分"
              onClick={() => setFilters((prev) => ({ ...prev, sort: "score" }))}
              color={filters.sort === "score" ? "primary" : "default"}
            />
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
