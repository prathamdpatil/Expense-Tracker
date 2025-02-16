import React from "react";
import DatePicker from "react-datepicker";

const ExpenseTable = ({
  filteredExpenses,
  selectedExpenses,
  handleSelectAll,
  handleCheckboxChange,
  editingRowId,
  editedData,
  handleChange,
  handleSave,
  handleEdit,
  setEditingRowId,
  users,
  categories,
  handleDeleteSelected,
  fetchUserStats
}) => {
  return (
    <div className="expense-container">
      <div className="action-buttons">
        <button
          onClick={handleDeleteSelected}
          className="delete-btn"
          disabled={selectedExpenses.length === 0}
        >
          Delete Selected
        </button>
        <button onClick={fetchUserStats} className="stats-btn">
          Show All Users' Expenses
        </button>
      </div>

      {filteredExpenses.length === 0 ? (
        <p className="no-data-message">No expenses available for the selected filters.</p>
      ) : (
        <table className="expense-table">
          <thead>
            <tr>
              <th className="select-column">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedExpenses.length === filteredExpenses.length && filteredExpenses.length > 0}
                />
              </th>
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
                  <input
                    type="checkbox"
                    checked={selectedExpenses.includes(expense.id)}
                    onChange={() => handleCheckboxChange(expense.id)}
                  />
                </td>
                <td>
                  {editingRowId === expense.id ? (
                    <select value={editedData.user_id} onChange={(e) => handleChange(e, "user_id")}>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span>{users.find((u) => u.id == expense.user_id)?.name || "Unknown"}</span>
                  )}
                </td>
                <td>
                  {editingRowId === expense.id ? (
                    <select value={editedData.category} onChange={(e) => handleChange(e, "category")}>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    categories.find((cat) => cat.id == expense.category)?.name || "Unknown"
                  )}
                </td>
                <td>
                  {editingRowId === expense.id ? (
                    <input type="number" value={editedData.amount} onChange={(e) => handleChange(e, "amount")} />
                  ) : (
                    `₹${expense.amount}`
                  )}
                </td>
                <td>
                  {editingRowId === expense.id ? (
                    <DatePicker
                      selected={editedData.date}
                      onChange={(date) => handleChange({ target: { value: date } }, "date")}
                      dateFormat="dd/MM/yyyy"
                    />
                  ) : (
                    new Date(expense.date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric"
                    })
                  )}
                </td>
                <td>
                  {editingRowId === expense.id ? (
                    <div className="save-cancel-btn">
                      <button onClick={() => handleSave(expense.id)} className="save-btn">
                        Save
                      </button>
                      <button onClick={() => setEditingRowId(null)} className="cancel-btn">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => handleEdit(expense)} className="edit-btn">
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ExpenseTable;
