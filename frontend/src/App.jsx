import React, { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./App.css";
import ExpenseTracker from "./components/ExpenseTracker";
import FilterPanel from "./components/FilterPanel";
import { API_URL, USER_API_URL, CATEGORY_API_URL, TOPDAYS_API_URL, MONTHCHANGE_API_URL, NEXTMONTH_API_URL } from "./assets/url";


const App = () => {
    const [users, setUsers] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedExpenses, setSelectedExpenses] = useState([]);
    const [editingRowId, setEditingRowId] = useState(null);
    const [editedData, setEditedData] = useState({});

    const [topThreeDays, setTopThreeDays] = useState([]);
    const [monthChange, setMonthChange] = useState(null);
    const [nextMonthPrediction, setNextMonthPrediction] = useState(null);
    
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);


  

    useEffect(() => {
        axios.get(USER_API_URL).then((res) => setUsers(res.data));
        axios.get(CATEGORY_API_URL).then((res) => setCategories(res.data));
        fetchExpenses();
    }, []);


    const fetchExpenses = async () => {
      try {
          const res = await axios.get(API_URL);
          setExpenses(res.data);
          setFilteredExpenses(res.data);
      } catch (error) {
          console.error("Error fetching expenses:", error);
      }
  };

  
    const applyFilters = (filterUser, filterCategory, startDate, endDate) => {
        const filtered = expenses.filter((expense) => {
            const expenseDate = new Date(expense.date);
            return (
                (filterUser ? expense.user_id.toString() === filterUser : true) &&
                (filterCategory ? expense.category.toLowerCase() === filterCategory.toLowerCase() : true) &&
                (startDate && endDate ? (expenseDate >= startDate && expenseDate <= endDate) : true)
            );
        });
        setFilteredExpenses(filtered);
    };

    const reSetFilterExpense=()=>{
      setFilteredExpenses(expenses);
    }

    const handleDeleteSelected = async () => {
      if (selectedExpenses.length === 0) {
          alert("Please select at least one expense to delete.");
          return;
      }
  
      if (!window.confirm("Are you sure you want to delete the selected expenses?")) {
          return;
      }
  
      try {
          await axios.delete(`${API_URL}/bulk`, {
              data: { ids: selectedExpenses },
          });
  
          setSelectedExpenses([]);
          fetchExpenses();
      } catch (error) {
          console.error("Error deleting expenses:", error);
      }
  };
  

    const handleEdit = (expense) => {
        setEditingRowId(expense.id);
        setEditedData({
            user_id: expense.user_id.toString(),
            category: expense.category,
            amount: expense.amount,
            date: new Date(expense.date),
        });
    };
    const handleUserClick = (userId) => {
      setSelectedUser(userId);
      setShowModal(true);
  };
  

    const handleChange = (e, field) => {
        setEditedData((prevData) => ({
            ...prevData,
            [field]: e.target.value
        }));
    };

    const handleSave = async (id) => {
        try {
            await axios.put(`${API_URL}/${id}`, {
                user_id: editedData.user_id,
                category: editedData.category,
                amount: editedData.amount,
                date: editedData.date.toISOString().split("T")[0]
            });
            setEditingRowId(null);
            fetchExpenses();  
        } catch (error) {
            console.error("Error updating expense:", error);
        }
    };
    const handleSelectAll = (e) => {
      if (e.target.checked) {
          setSelectedExpenses(filteredExpenses.map((expense) => expense.id));
      } else {
          setSelectedExpenses([]);
      }
  };
  const handleCheckboxChange = (id) => {
    setSelectedExpenses((prevSelected) =>
        prevSelected.includes(id)
            ? prevSelected.filter((expenseId) => expenseId !== id)
            : [...prevSelected, id] 
    );
};

useEffect(() => {
  async function getStat() {
      if (!selectedUser) return;

      try {
          const [topDaysRes, monthChangeRes, nextMonthRes] = await Promise.all([
              axios.get(`${TOPDAYS_API_URL}${selectedUser}`),
              axios.get(`${MONTHCHANGE_API_URL}${selectedUser}`),
              axios.get(`${NEXTMONTH_API_URL}${selectedUser}`)
          ]);

          console.log("Top 3 Days:", topDaysRes.data);
          console.log("Monthly Change:", monthChangeRes.data);
          console.log("Next Month Prediction:", nextMonthRes.data);

          setTopThreeDays(Array.isArray(topDaysRes.data) ? topDaysRes.data : []);
          setMonthChange(monthChangeRes.data);
          setNextMonthPrediction(nextMonthRes.data);
      } catch (error) {
          console.error("Error fetching statistics:", error);
          setTopThreeDays([]);
          setMonthChange(null);
          setNextMonthPrediction(null);
      }
  }

  getStat();
}, [selectedUser]);




const getUserName=()=>{
  let name = users.find(u => u.id === selectedUser)?.name
  return name;
}
    return (
        <div className="container">
            
            <ExpenseTracker
               users={users}
               categories={categories}
               fetchExpenses={fetchExpenses}
            />
           
           <FilterPanel
            users={users}
            applyFilters={applyFilters}
            reSetFilterExpense={reSetFilterExpense}
            categories={categories}
           />
           
            <div className="action-buttons">
                <button onClick={handleDeleteSelected} className="delete-btn" disabled={selectedExpenses.length === 0}>
                    Delete Selected
                </button>
            </div>
            <div className="expense-container">
                <table className="expense-table">
                    <thead>
                        <tr>
                            <th className="select-column"><input type="checkbox" onChange={handleSelectAll} checked={selectedExpenses.length === filteredExpenses.length && filteredExpenses.length > 0} /></th>
                            <th>User</th>
                            <th>Category</th>
                            <th>Amount</th>
                            <th>Date (DD/MM/YYYY)</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredExpenses.map((expense) => (
                            <tr key={expense.id}>
                                 <td>
                                    <input type="checkbox" checked={selectedExpenses.includes(expense.id)} onChange={() => handleCheckboxChange(expense.id)} />
                                </td>
                                
                                <td>{editingRowId === expense.id ? <select value={editedData.user_id} onChange={(e) => handleChange(e, "user_id")}>{users.map((u) => (<option key={u.x} value={u.id}>{u.name}</option>))}</select> :  <span className="clickable-user" onClick={() => handleUserClick(expense.user_id)}>{users.find((u) => u.id == expense.user_id)?.name || "Unknown"}</span>}</td>
                                <td>{editingRowId === expense.id ? <select value={editedData.category} onChange={(e) => handleChange(e, "category")}>{categories.map((cat) => (<option key={cat.id} value={cat.name}>{cat.name}</option>))}</select> : expense.category}</td>
                                <td>{editingRowId === expense.id ? <input type="number" value={editedData.amount} onChange={(e) => handleChange(e, "amount")} /> : `₹${expense.amount}`}</td>
                                <td>
                                      {editingRowId === expense.id ? (
                                          <DatePicker 
                                              selected={editedData.date} 
                                              onChange={(date) => setEditedData({ ...editedData, date })} 
                                              dateFormat="dd/MM/yyyy"
                                          />
                                      ) : (
                                          new Date(expense.date).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })
                                      )}
                                </td>                                
                                <td>{editingRowId === expense.id ? 
                                <div className="save-cancel-btn">
                                  <button onClick={() => handleSave(expense.id)} className="save-btn">Save</button>
                                  <button onClick={() => setEditingRowId(null)} className="cancel-btn">Cancel</button>
                                </div> : <button onClick={() => handleEdit(expense)} className="edit-btn">Edit</button>}</td>
                            </tr>
                        ))}
                    </tbody>
                  </table>

                {showModal && selectedUser && (
                          <div className="modal">
                              <div className="modal-content">
                                  <span className="close-btn" onClick={() => setShowModal(false)}>&times;</span>
                                  
                                  <h2>Statistics for {getUserName()}</h2>

                                  <div className="stat-section">
                          <h3>Top 3 Expenditure Days</h3>
                          <ul>
                              {Array.isArray(topThreeDays) && topThreeDays.length > 0 ? (
                                  topThreeDays.map(({ date, total_spent }) => (
                                      <li key={date}>
                                          <strong>{new Date(date).toLocaleDateString("en-GB")}</strong>: ₹{parseFloat(total_spent).toFixed(2)}
                                      </li>
                                  ))
                              ) : (
                                  <p>No data available</p>
                              )}
                          </ul>
                      </div>

                                  <div className="stat-section">
                                      <h3>Monthly Expenditure Change</h3>
                                      <p className="percentage-change">
                                          {(monthChange && monthChange.percentage_change !== null)
                                              ? `${parseFloat(monthChange.percentage_change).toFixed(2)}%`
                                              : "No data available"}
                                      </p>
                                  </div>

                                  <div className="stat-section">
                                      <h3>Predicted Next Month's Expenditure</h3>
                                      <p className="predicted-exp">
                                          {nextMonthPrediction && nextMonthPrediction.predicted_next_month !== null
                                              ? `₹${parseFloat(nextMonthPrediction.predicted_next_month).toFixed(2)}`
                                              : "No data available"}
                                      </p>
                                  </div>


        </div>
    </div>
)}


</div>
</div>
);
};

export default App;
