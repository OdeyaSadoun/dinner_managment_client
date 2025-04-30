import { useState } from 'react';
import PropTypes from 'prop-types';
import { TextField, Paper, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';


const SearchBar = ({ data, onSearch, searchBy }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    const searchValue = e.target.value;
    setSearchTerm(searchValue);

    let filteredData = data;

    if (searchValue !== '') {
      filteredData = data.filter((item) =>
        searchBy.some((searchField) =>
          searchField(item)?.toLowerCase().includes(searchValue.toLowerCase())
        )
      );
    }

    onSearch(filteredData, searchValue);
  };

  return (
    <Paper sx={{ boxShadow: 'none' }}>
      <TextField
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={handleSearch}
        placeholder="חפש..."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ direction: 'rtl' }}
      />
    </Paper>
  );
};

SearchBar.propTypes = {
  data: PropTypes.array.isRequired,
  onSearch: PropTypes.func.isRequired,
  searchBy: PropTypes.arrayOf(PropTypes.func).isRequired,
};

export default SearchBar;