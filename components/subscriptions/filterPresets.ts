import { getGenreLabel, type GenreId } from '@/src/domain/genre';
import type { PresetService } from '@/src/domain/preset';

export function filterPresets(
  presets: PresetService[],
  query: string,
  genreFilter: GenreId | null
): PresetService[] {
  const keyword = query.trim().toLowerCase();
  const genreLabel = genreFilter ? getGenreLabel(genreFilter) : null;

  return presets.filter((preset) => {
    const matchesGenre = genreLabel === null || preset.genre === genreLabel;
    const matchesKeyword = !keyword || preset.name.toLowerCase().includes(keyword);
    return matchesGenre && matchesKeyword;
  });
}
