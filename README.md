1:- install node module both frontend and backend

npm install



2:- create database expense_tracker;
use expense_tracker;
show databases;


CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50),
    email VARCHAR(100),
    status VARCHAR(20)
);

CREATE TABLE Categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50)
);

CREATE TABLE Expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    category_id INT,
    amount DECIMAL(10, 2),
    date DATE,
    description TEXT,
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (category_id) REFERENCES Categories(id)
);


INSERT INTO Users (id, name, email, status) 
VALUES
(1, 'John Doe', 'john.doe@example.com', 'active'),
(2, 'Jane Smith', 'jane.smith@example.com', 'active'),
(3, 'Michael Brown', 'michael.brown@example.com', 'inactive'),
(4, 'Emily Johnson', 'emily.johnson@example.com', 'active'),
(5, 'Chris Wilson', 'chris.wilson@example.com', 'active');



INSERT INTO Categories (id, name) 
VALUES
(6, 'Bills'),
(7, 'Education'),
(4, 'Entertainment'),
(1, 'Food'),
(5, 'Health'),
(3, 'Shopping'),
(2, 'Transport');

.env file
DB_HOST=localhost
DB_USER=root
DB_PASSWORD= 
DB_NAME=expense_tracker
DB_PORT=3306

