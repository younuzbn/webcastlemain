/**
 * Helper function to get the correct path for assets considering the basePath
 * This is especially important for GitHub Pages deployment
 */
export function getAssetPath(path: string): string {
  // Check if we're in production (GitHub Pages) or development
  const basePath = process.env.NODE_ENV === 'production' ? '/webcastlemain' : '';
  
  // Ensure the path starts with a slash but doesn't have a trailing slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // Combine the basePath with the asset path
  return `${basePath}${normalizedPath}`;
}

/**
 * For use with Next.js Image component, which already handles the basePath
 * from next.config.js, so we don't need to add it again
 */
export function getNextImagePath(path: string): string {
  // Ensure the path starts with a slash but doesn't have a trailing slash
  return path.startsWith('/') ? path : `/${path}`;
} 