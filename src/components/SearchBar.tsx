import React from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { Input } from '../ui/input.tsx';

type Props = {
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	availableTags?: string[];
	selectedTags?: string[];
	toggleTag?: (tag: string) => void;
	onManageTags?: () => void;
	className?: string;
};

export const SearchBar: React.FC<Props> = ({
	value,
	onChange,
	availableTags = [],
	selectedTags = [],
	toggleTag,
	onManageTags,
	className = '',
}) => {
		return (
			<div className={`flex items-center gap-2 ${className}`}>
				{/* Filter removed per UX request */}

					<div className="relative flex-1">
						<SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-400 pointer-events-none" size={14} />
						{/* use input-search to disable focus glow and avoid visual artifacts */}
						<Input value={value} onChange={onChange} placeholder="Search clients..." className="input-search pl-10 w-80" />
					</div>
		</div>
	);
};

export default SearchBar;
