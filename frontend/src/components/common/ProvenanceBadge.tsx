import React from 'react';
import { DataClass, Provenance } from '../../types/antwin';

interface Props {
  dataClass: DataClass;
  provenance?: Provenance;
  onClick?: (prov: Provenance) => void;
}

export const ProvenanceBadge: React.FC<Props> = ({ dataClass, provenance, onClick }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick && provenance) {
      onClick(provenance);
    }
  };

  return (
    <span
      className={`prov-badge ${dataClass}`}
      onClick={handleClick}
      title={`Click to view provenance for ${dataClass} data`}
    >
      <span style={{
        width: 5,
        height: 5,
        borderRadius: '50%',
        backgroundColor: 'currentColor',
        display: 'inline-block'
      }} />
      {dataClass}
    </span>
  );
};
