import React from 'react';
import { useTable, Column } from 'react-table';

import { Data } from './types';

export type Props = {
  columns: Column<Data>[];
  data: Data[];
};

const Widget: React.FC<Props> = ({ columns, data }: Props) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data });

  return (
    <>
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup, hgi) => (
            <tr {...headerGroup.getHeaderGroupProps()} key={`tr-${hgi}`}>
              {headerGroup.headers.map((column, ci) => (
                <th {...column.getHeaderProps()} key={`th-${ci}`}>
                  {column.render('Header')}
                  <span>
                    {column.isSorted ? (column.isSortedDesc ? ' ^' : ' v') : ''}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row, ri) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} key={`tr-${ri}`}>
                {row.cells.map((cell, ci) => (
                  <td {...cell.getCellProps()} key={`td-${ci}`}>
                    {cell.render('Cell')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};

export default Widget;
