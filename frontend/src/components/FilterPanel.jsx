import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";  

const FilterPanel =({users, applyFilters, reSetFilterExpense, categories})=>{
    const [filterUser, setFilterUser] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);


    const resetFilters = () => {
        setFilterUser("");
        setFilterCategory("");
        setStartDate(null);
        setEndDate(null);
        reSetFilterExpense()
    };


    return (
        <div className="filters">
        <select value={filterUser} onChange={(e) => setFilterUser(e.target.value)}>
            <option value="">Filter by User</option>
            {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
            ))}
        </select>

        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="">Filter by Category</option>
            {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
        </select>

        <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} placeholderText="Start Date" />
        <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} placeholderText="End Date" />

        <button onClick={()=>applyFilters(filterUser, filterCategory, startDate, endDate)}>Apply Filters</button>
        <button onClick={resetFilters}>Reset Filters</button>
    </div>
    )
}

export default FilterPanel;