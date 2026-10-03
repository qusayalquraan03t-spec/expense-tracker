const API_URL = "http://localhost:3000/api/expenses";

const container = document.getElementById("expenses-container");
const form = document.getElementById("expense-form");
const categoryFilter = document.getElementById("category-filter");
const message = document.getElementById("message");

const loading = document.getElementById("loading");

let editingId = null;


// =========================
// Load Expenses
// =========================

async function loadExpenses() {
    try {
        loading.classList.remove("d-none");

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to load expenses");
        }

        const expenses = await response.json();

        // Category Filter
        const selectedCategory = categoryFilter.value;

        const filteredExpenses = selectedCategory === "All"
            ? expenses
            : expenses.filter(
                expense => expense.category === selectedCategory
            );


        // Summary
        const totalAmount = expenses.reduce(
            (total, expense) => total + Number(expense.amount),
            0
        );

        const expenseCount = expenses.length;

        const highestExpense = expenses.length > 0
            ? Math.max(
                ...expenses.map(
                    expense => Number(expense.amount)
                )
            )
            : 0;


        // Update Summary Cards
        document.getElementById("total-amount").textContent =
            totalAmount.toFixed(2);

        document.getElementById("expense-count").textContent =
            expenseCount;

        document.getElementById("highest-expense").textContent =
            highestExpense.toFixed(2);


        // Clear Table
        container.innerHTML = "";


        // No Expenses
        if (filteredExpenses.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">
                        <div class="alert alert-info mb-0">
                            No expenses found.
                        </div>
                    </td>
                </tr>
            `;

            return;
        }


        // Display Expenses
        filteredExpenses.forEach(expense => {
            container.innerHTML += `
                <tr>

                    <td>${expense.title}</td>

                    <td>
                        ${Number(expense.amount).toFixed(2)}
                    </td>

                    <td>
                        <span class="badge bg-primary">
                            ${expense.category}
                        </span>
                    </td>

                    <td>${expense.date}</td>

                    <td>
                        <button
                            class="btn btn-warning btn-sm"
                            onclick="editExpense(${expense.id})"
                        >
                            Edit
                        </button>

                        <button
                            class="btn btn-danger btn-sm"
                            onclick="deleteExpense(${expense.id})"
                        >
                            Delete
                        </button>
                    </td>

                </tr>
            `;
        });

    } catch (error) {

        console.error(error);

        message.innerHTML = `
            <div class="alert alert-danger">
                Failed to load expenses.
            </div>
        `;

    } finally {
        loading.classList.add("d-none");
    }
}


// =========================
// Add Expense
// =========================

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const expense = {
        title: document.getElementById("title").value,
        amount: Number(
            document.getElementById("amount").value
        ),
        category: document.getElementById("category").value,
        date: document.getElementById("date").value
    };

    try {

        const response = await fetch(API_URL, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(expense)
        });


        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Failed to add expense"
            );
        }


        message.innerHTML = `
            <div class="alert alert-success">
                Expense added successfully!
            </div>
        `;


        form.reset();

        await loadExpenses();

    } catch (error) {

        console.error(error);

        message.innerHTML = `
            <div class="alert alert-danger">
                ${error.message}
            </div>
        `;
    }
});


// =========================
// Edit Expense
// =========================

async function editExpense(id) {

    try {

        const response = await fetch(`${API_URL}/${id}`);

        if (!response.ok) {
            throw new Error("Failed to get expense");
        }


        const expense = await response.json();


        // Fill Modal
        document.getElementById("edit-title").value =
            expense.title;

        document.getElementById("edit-amount").value =
            expense.amount;

        document.getElementById("edit-category").value =
            expense.category;

        document.getElementById("edit-date").value =
            expense.date;


        editingId = id;


        // Open Modal
        const modalElement =
            document.getElementById("editExpenseModal");

        const editModal =
            bootstrap.Modal.getOrCreateInstance(
                modalElement
            );

        editModal.show();

    } catch (error) {

        console.error(error);

        message.innerHTML = `
            <div class="alert alert-danger">
                ${error.message}
            </div>
        `;
    }
}


// =========================
// Update Expense From Modal
// =========================

const editExpenseForm =
    document.getElementById("edit-expense-form");


editExpenseForm.addEventListener("submit", async (event) => {

    event.preventDefault();


    const expense = {
        title: document.getElementById("edit-title").value,

        amount: Number(
            document.getElementById("edit-amount").value
        ),

        category:
            document.getElementById("edit-category").value,

        date:
            document.getElementById("edit-date").value
    };


    try {

        const response = await fetch(
            `${API_URL}/${editingId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(expense)
            }
        );


        const data = await response.json();


        if (!response.ok) {
            throw new Error(
                data.error || "Failed to update expense"
            );
        }


        // Close Modal
        const modalElement =
            document.getElementById("editExpenseModal");

        const editModal =
            bootstrap.Modal.getOrCreateInstance(
                modalElement
            );

        editModal.hide();


        editingId = null;


        message.innerHTML = `
            <div class="alert alert-success">
                Expense updated successfully!
            </div>
        `;


        // Reload expenses
        await loadExpenses();

    } catch (error) {

        console.error(error);

        message.innerHTML = `
            <div class="alert alert-danger">
                ${error.message}
            </div>
        `;
    }
});


// =========================
// Delete Expense
// =========================

async function deleteExpense(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this expense?"
    );


    if (!confirmed) {
        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/${id}`,
            {
                method: "DELETE"
            }
        );


        const data = await response.json();


        if (!response.ok) {
            throw new Error(
                data.error || "Failed to delete expense"
            );
        }


        message.innerHTML = `
            <div class="alert alert-success">
                Expense deleted successfully!
            </div>
        `;


        await loadExpenses();

    } catch (error) {

        console.error(error);

        message.innerHTML = `
            <div class="alert alert-danger">
                ${error.message}
            </div>
        `;
    }
}


// =========================
// Category Filter
// =========================

categoryFilter.addEventListener("change", () => {
    loadExpenses();
});


// =========================
// Initial Load
// =========================

loadExpenses();