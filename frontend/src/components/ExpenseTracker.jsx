import React, { useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_URL } from "../assets/url";

const ExpenseTracker = ({ users, categories, setUpdated }) => {
    const [user, setUser] = useState("");
    const [category, setCategory] = useState("");
    const [date, setDate] = useState(new Date());
    const [amount, setAmount] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user || !category || !amount) {
            toast.error("All fields except description are required");
            return;
        }
    
        try {
            let response = await axios.post(API_URL, {
                user_id: user,
                category,
                amount,
                date: date.toISOString().split("T")[0],
            });
    
            if (response.status === 201) {
                setUser("");
                setCategory("");
                setAmount("");
                setDate(new Date());
                setUpdated(true);
                toast.success(response.data.message);
            }
        } catch (error) {
            if (error.response) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Something went wrong. Please try again.");
            }
        }
    };
    

    return (
        <>
            <h2>Expense Tracker</h2>
            <form onSubmit={handleSubmit} className="expense-form">
                <select value={user} onChange={(e) => setUser(e.target.value)} required>
                    <option value="">Select User</option>
                    {users.map((u) => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                </select>

                <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>

                <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                
                <DatePicker 
                    selected={date} 
                    onChange={(date) => setDate(date)} 
                    className="adddate" 
                    dateFormat="dd/MM/yyyy" 
                    required 
                />

                <button type="submit">Add Expense</button>
            </form>

            <ToastContainer position="top-right" autoClose={3000} />
        </>
    );
};

export default ExpenseTracker;
