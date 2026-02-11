import React from 'react';
import { Tag } from './Tag';

export const TagList = ({ tags }: { tags: string[] }) => {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {tags.map((tag) => (
        <li key={tag}>
          <Tag size="small">{tag}</Tag>
        </li>
      ))}
    </ul>
  );
};
