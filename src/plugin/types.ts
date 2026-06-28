export type RGB = { r: number, g: number, b: number };

export interface ComponentNode {
  name?: string;
  type: 'frame' | 'text' | 'image' | 'group';
  originalTag: string;
  children: ComponentNode[];
  rawClassName: string[];
  rawInlineStyle?: Record<string, string | number>;
  props: Record<string, any>;
  
  text?: string;
  isIcon?: boolean;

  variants?: Record<string, ComponentNode>;
}

export type ParsedNode = ComponentNode; // Alias for backward compatibility

export interface ResolvedStyle {
  width?: number | 'FILL';
  height?: number | 'FILL';
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  backgroundColor?: string;
  color?: string;
  fontSize?: number;
  fontWeight?: string;
  lineHeight?: number | string;
  display?: 'flex' | 'none' | 'block';
  flexDirection?: 'row' | 'column';
  gap?: number;
  alignItems?: 'MIN' | 'MAX' | 'CENTER' | 'SPACE_BETWEEN';
  justifyContent?: 'MIN' | 'MAX' | 'CENTER' | 'SPACE_BETWEEN';
  borderRadius?: number;
  borderTopLeftRadius?: number;
  borderTopRightRadius?: number;
  borderBottomLeftRadius?: number;
  borderBottomRightRadius?: number;
  borderColor?: string;
  borderWidth?: number;
  opacity?: number;
  isAbsolute?: boolean;
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
  textAlign?: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED';
  fontFamily?: string;
  clipsContent?: boolean;

}

export interface ParsedScreen {
  filename: string;
  name: string;
  tree: ComponentNode;
  isDefaultExport?: boolean;
  variants?: Record<string, ComponentNode>;
}
