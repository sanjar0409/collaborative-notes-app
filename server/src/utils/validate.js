const { z } = require('zod');

const signupSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Invalid email format')
    .max(255, 'Email must be at most 255 characters')
    .toLowerCase(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters'),
});

const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Invalid email format')
    .toLowerCase(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
});

const noteSchema = z.object({
  title: z
    .string()
    .trim()
    .max(255, 'Title must be at most 255 characters')
    .optional(),
  content: z.string().optional(),
});

const commentSchema = z.object({
  content: z
    .string({ required_error: 'Content is required' })
    .trim()
    .min(1, 'Content cannot be empty')
    .max(5000, 'Comment must be at most 5000 characters'),
});

const emailSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Invalid email format')
    .toLowerCase(),
});

const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Invalid email format')
    .toLowerCase(),
});

const resetPasswordSchema = z.object({
  token: z.string({ required_error: 'Token is required' }).min(1, 'Token is required'),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Invalid email format')
    .toLowerCase(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters'),
});

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => issue.message);
      return res.status(400).json({ error: errors[0], errors });
    }
    req.body = result.data;
    next();
  };
}

module.exports = {
  signupSchema,
  loginSchema,
  noteSchema,
  commentSchema,
  emailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  validate,
};
