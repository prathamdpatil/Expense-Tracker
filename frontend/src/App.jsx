import React, { useEffect, useState } from "react";
import axios from "axios";
import "react-datepicker/dist/react-datepicker.css";
import "./App.css";
import ExpenseTracker from "./components/ExpenseTracker";
import { ToastContainer, toast } from 'react-toastify';
import FilterPanel from "./components/FilterPanel";
import UserStatsModal  from "./components/UserStatsModal";
import ExpenseTable from "./components/ExpenseTable";
import ConfirmModal from "./components/ConfirmModal";
import { API_URL, USER_API_URL, CATEGORY_API_URL,STATS_ALL_USERS_API } from "./assets/url";


const App = () => {
    const [users, setUsers] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedExpenses, setSelectedExpenses] = useState([]);
    const [editingRowId, setEditingRowId] = useState(null);
    const [editedData, setEditedData] = useState({});
    const [updated,setUpdated]= useState(false);
    const [showModal, setShowModal] = useState(false);
    const [userStats, setUserStats] = useState([]);
    const [showConfirm, setShowConfirm] = useState(false);


    useEffect(() => {
        axios.get(API_URL).then((res)=> {setExpenses(res.data);
            setFilteredExpenses(res.data)}).catch(err => toast.error(err.response)).finally(()=>{
                setUpdated(false)
            })
        axios.get(USER_API_URL).then((res) => setUsers(res.data)).catch(err => toast.error(err.response))
        axios.get(CATEGORY_API_URL).then((res) => setCategories(res.data)).catch(err => toast.error(err.response))
        
    }, [updated]);
  
  const applyFilters = (filterUser, filterCategory, startDate, endDate) => {
    const filtered = expenses.filter((expense) => {
        const expenseDate = new Date(expense.date);
        
        return (
            (filterUser ? expense.user_id.toString() === filterUser : true) &&
            (filterCategory ? expense.category.toString() === filterCategory.toString() : true) &&
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
          toast.error("Please select at least one expense to delete.");
          return;
        }
        
        setShowConfirm(true);
      };
      
      const confirmDelete = async () => {
        try {
          const response = await axios.delete(`${API_URL}/bulk`, {
            data: { ids: selectedExpenses },
          });
      
          setSelectedExpenses([]);
          setUpdated(true);
          toast.success(response.data.message);
        } catch (error) {
          toast.error("Failed to delete expenses. Please try again.");
        }
        setShowConfirm(false);
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

    const handleChange = (e, field) => {
        setEditedData((prevData) => ({
            ...prevData,
            [field]: e.target.value
        }));
    };

    const handleSave = async (id) => {
        const existingExpense = expenses.find(exp => exp.id === id);
        if (!existingExpense) {
            toast.error("Expense not found.");
            return;
        }
    
        try {
            let updatedExpense = {
                user_id: editedData.user_id !== undefined ? Number(editedData.user_id) : existingExpense.user_id,
                category: editedData.category !== undefined ? String(editedData.category) : String(existingExpense.category),
                amount: editedData.amount !== undefined ? Number(editedData.amount) : existingExpense.amount,
                date: editedData.date 
                    ? new Date(editedData.date).toLocaleDateString("en-CA") // ✅ Fix: Keep date format consistent (YYYY-MM-DD)
                    : existingExpense.date, 
            };
    
            let response = await axios.put(`${API_URL}/${id}`, updatedExpense);
    
            if (response.status === 200) {  
                setEditingRowId(null);
                setUpdated(true);
                toast.success(response.data.message);
            }
        } catch (error) {
            console.error("Error updating expense:", error);
    
            if (error.response) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Failed to update expense. Please try again.");
            }
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

    const fetchUserStats = async () => {
        try {
            const response = await axios.get(STATS_ALL_USERS_API);
            setUserStats(response.data);
            setShowModal(true);
        } catch (error) {
            console.error("Error fetching user statistics:", error);
            toast.error("Failed to fetch user statistics.");
        }
    };

    return (
        <div className="container">
            <ExpenseTracker
               users={users}
               categories={categories}
               setUpdated={setUpdated}
            />
           <FilterPanel
            users={users}
            applyFilters={applyFilters}
            reSetFilterExpense={reSetFilterExpense}
            categories={categories}
           />
           <ConfirmModal
            show={showConfirm}
            onConfirm={confirmDelete}
            onCancel={() => setShowConfirm(false)}
            message="Are you sure you want to delete the selected expenses?"
            />
           <ExpenseTable
                    filteredExpenses={filteredExpenses}
                    selectedExpenses={selectedExpenses}
                    handleSelectAll={handleSelectAll}
                    handleCheckboxChange={handleCheckboxChange}
                    editingRowId={editingRowId}
                    editedData={editedData}
                    handleChange={handleChange}
                    handleSave={handleSave}
                    handleEdit={handleEdit}
                    setEditingRowId={setEditingRowId}
                    users={users}
                    categories={categories}
                    handleDeleteSelected={handleDeleteSelected}
                    fetchUserStats={fetchUserStats}
            />
           <UserStatsModal 
                showModal={showModal} 
                setShowModal={setShowModal} 
                userStats={userStats} 
            />
   </div>
);
};

export default App;
