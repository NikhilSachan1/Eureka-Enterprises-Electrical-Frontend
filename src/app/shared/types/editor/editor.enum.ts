/**
 * Quill editor toolbar options. Values must match Quill format names for buttons to work.
 * - Strikethrough in Quill = 'strike' (not 'strikethrough').
 * - Script (subscript/superscript) needs value: use SCRIPT_SUB / SCRIPT_SUPER so we can render value="sub" | "super".
 */
export enum EEditorToolbarOption {
  ALIGNMENT = 'align',
  BACKGROUND = 'background',
  BLOCKQUOTE = 'blockquote',
  BOLD = 'bold',
  COLOR = 'color',
  DIRECTION = 'direction',
  FONT = 'font',
  HEADER = 'header',
  INDENT = 'indent',
  ITALIC = 'italic',
  LINK = 'link',
  LIST = 'list',
  SIZE = 'size',
  STRIKETHROUGH = 'strike',
  SCRIPT_SUB = 'script_sub',
  SCRIPT_SUPER = 'script_super',
}
