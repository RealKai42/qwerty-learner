export const isLegal = (val: string): boolean => /^[a-z_A-Z_._(_)_1-9'-]$/.test(val)
