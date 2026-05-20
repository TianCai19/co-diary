import { z } from "zod";

export const registerSchema = z.object({
  nickname: z.string().trim().min(2, "昵称至少 2 个字符").max(24, "昵称最多 24 个字符"),
  email: z.email("请输入正确的邮箱地址").trim().toLowerCase(),
  password: z
    .string()
    .min(8, "密码至少 8 位")
    .regex(/[A-Za-z]/, "密码需包含字母")
    .regex(/[0-9]/, "密码需包含数字"),
});

export const loginSchema = z.object({
  email: z.email("请输入正确的邮箱地址").trim().toLowerCase(),
  password: z.string().min(1, "请输入密码"),
});

export const notebookSchema = z.object({
  name: z.string().trim().min(2, "日记本名称至少 2 个字符").max(40, "日记本名称最多 40 个字符"),
});

export const inviteSchema = z.object({
  inviteCode: z.string().trim().min(6, "请输入有效的邀请码"),
});

export const entrySchema = z.object({
  title: z.string().trim().max(80, "标题最多 80 个字符").optional(),
  content: z.string().trim().min(10, "正文至少 10 个字符").max(10000, "正文最多 10000 个字符"),
});

export const commentSchema = z.object({
  content: z.string().trim().min(1, "评论不能为空").max(1000, "评论最多 1000 个字符"),
  parentId: z.string().trim().optional(),
});
