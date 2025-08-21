declare module '*.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.sass' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.less' {
  const classes: { [key: string]: string };
  export default classes;
}

// Add this to fix the @tailwind directive errors
declare module 'tailwindcss' {
  const content: any;
  export default content;
}

declare module 'tailwindcss/plugin' {
  const plugin: any;
  export default plugin;
}
