export const PRESET_GRID_COLUMNS = 3;
export const PRESET_GRID_GAP = 12;
export const PRESET_GRID_HORIZONTAL_PADDING = 20;

export function getPresetGridCardWidth(screenWidth: number): number {
  return (
    (screenWidth -
      PRESET_GRID_HORIZONTAL_PADDING * 2 -
      PRESET_GRID_GAP * (PRESET_GRID_COLUMNS - 1)) /
    PRESET_GRID_COLUMNS
  );
}
