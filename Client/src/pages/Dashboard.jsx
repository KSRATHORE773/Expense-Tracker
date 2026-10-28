import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import axios from "axios";

function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showForm, setShowForm] = useState(false);
  const [Data, setData] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  const navigate = useNavigate();

  let totalExpenses = 0;
  for (let i = 0; i < Data.length; i++) {
    totalExpenses = totalExpenses + Number(Data[i].amount);
  }

  const getExpenses = () => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      navigate("/login");
      return;
    }

    axios
      .get("http://localhost:3000/api/expenses", {
        headers: {
          Authorization: "Bearer " + token,
        },
      })
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    getExpenses();
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("userToken");

    const expenseObj = {
      title: title,
      amount: Number(amount),
      category: category,
      paymentMethod: paymentMethod,
      date: date,
      description: description,
    };

    if (editingId) {
      axios
        .put("http://localhost:3000/api/expenses/" + editingId, expenseObj, {
          headers: {
            Authorization: "Bearer " + token,
          },
        })
        .then(() => {
          alert("Expense updated successfully!");
          resetForm();
          getExpenses();
        })
        .catch((err) => {
          console.log(err);
          alert("Error updating expense");
        });
    } else {
      axios
        .post("http://localhost:3000/api/expenses", expenseObj, {
          headers: {
            Authorization: "Bearer " + token,
          },
        })
        .then(() => {
          alert("Expense added successfully!");
          resetForm();
          getExpenses();
        })
        .catch((err) => {
          console.log(err);
          alert("Error adding expense");
        });
    }
  };

  const resetForm = () => {
    setTitle("");
    setAmount("");
    setCategory("");
    setPaymentMethod("");
    setDate("");
    setDescription("");
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (item) => {
    setTitle(item.title);
    setAmount(item.amount);
    setCategory(item.category);
    setPaymentMethod(item.paymentMethod);
    setDate(item.date ? item.date.slice(0, 10) : "");
    setDescription(item.description || "");
    setEditingId(item._id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete?")) {
      const token = localStorage.getItem("userToken");
      axios
        .delete("http://localhost:3000/api/expenses/" + id, {
          headers: {
            Authorization: "Bearer " + token,
          },
        })
        .then(() => {
          getExpenses();
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h3>Expense Tracker</h3>
        <button
          className={activeTab === "dashboard" ? "sidebar-btn active" : "sidebar-btn"}
          onClick={() => {
            setActiveTab("dashboard");
            setShowForm(false);
          }}
        >
          Dashboard
        </button>
        <button
          className={activeTab === "expenses" ? "sidebar-btn active" : "sidebar-btn"}
          onClick={() => {
            setActiveTab("expenses");
            setShowForm(false);
          }}
        >
          Expenses
        </button>
        <button className="sidebar-btn logout" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="main-content">
        {activeTab === "dashboard" && (
          <div>
            <h2>Dashboard</h2>
            <div className="card-box">
              <div className="summary-card">
                <p>Total Expenses</p>
                <h3>₹ {totalExpenses}</h3>
              </div>
              <div className="summary-card">
                <p>Total Records</p>
                <h3>{Data.length}</h3>
              </div>
            </div>

            <div className="recent-container">
              <h3>Recent Expenses</h3>
              {Data.length === 0 ? (
                <p className="no-data">No expenses added yet.</p>
              ) : (
                <div className="recent-list">
                  {Data.slice(0, 5).map((item) => (
                    <div className="recent-card" key={item._id}>
                      <div>
                        <h4>{item.title}</h4>
                        <p>{item.category}</p>
                      </div>
                      <div>
                        <h4>₹ {item.amount}</h4>
                        <p>{item.date ? item.date.slice(0, 10) : ""}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "expenses" && (
          <div>
            <h2>Expenses</h2>
            <div className="expense-content">
              {showForm ? (
                <div className="form-card">
                  <h3>{editingId ? "Edit Expense" : "Add Expense"}</h3>
                  <form onSubmit={handleSave}>
                    <div className="form-group">
                      <label>Title</label>
                      <input
                        type="text"
                        placeholder="Enter title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Amount</label>
                      <input
                        type="number"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                      >
                        <option value="">Select category</option>
                        <option value="Food">Food</option>
                        <option value="Transport">Transport</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Bills">Bills</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Payment Method</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        required
                      >
                        <option value="">Select method</option>
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI</option>
                        <option value="Card">Card</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Date</label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <input
                        type="text"
                        placeholder="Enter description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                    <div className="btn-group">
                      <button type="submit" className="btn-save">
                        {editingId ? "Update" : "Save"}
                      </button>
                      <button
                        type="button"
                        className="btn-cancel"
                        onClick={resetForm}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div>
                  <div className="list-header">
                    <h3>Expense Listing</h3>
                    <button
                      className="btn-add"
                      onClick={() => {
                        resetForm();
                        setShowForm(true);
                      }}
                    >
                      + Add Expense
                    </button>
                  </div>

                  {Data.length === 0 ? (
                    <p className="no-data">No records found. Click "+ Add Expense" to start.</p>
                  ) : (
                    <table className="expense-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Title</th>
                          <th>Category</th>
                          <th>Amount</th>
                          <th>Date</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Data.map((item, index) => (
                          <tr key={item._id}>
                            <td>{index + 1}</td>
                            <td>{item.title}</td>
                            <td>{item.category}</td>
                            <td>₹ {item.amount}</td>
                            <td>{item.date ? item.date.slice(0, 10) : ""}</td>
                            <td>
                              <button
                                className="action-btn edit-btn"
                                onClick={() => handleEdit(item)}
                              >
                                Edit
                              </button>
                              <button
                                className="action-btn del-btn"
                                onClick={() => handleDelete(item._id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;