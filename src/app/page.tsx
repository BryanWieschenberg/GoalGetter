"use client";

import { useState, useEffect } from "react";

interface User {
    id: number;
    username: string;
    email: string;
}

export default function Home() {
    const [users, setUsers] = useState<User[]>([]);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [editingId, setEditingId] = useState<null | number>(null);
    
    const fetchUsers = async () => {
        const res = await fetch("/api/users");
        const data = await res.json();
        setUsers(data);
    };

    const createUser = async () => {
        const res = await fetch("/api/users", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({username, email})
        });
        const newUser = await res.json();
        setUsers([...users, newUser])
        reload();
    };

    const updateUser = async () => {
        if (editingId === null) return;
        const res = await fetch(`/api/users?id=${editingId}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({username, email})
        });
        const updatedUser = await res.json();
        setUsers(users.map(user =>
            user.id === updatedUser.id ?
                updatedUser :
                user
        ));
        reload();
    };

    const deleteUser = async (id: number) => {
        await fetch(`/api/users?id=${id}`, {
            method: "DELETE"
        });
        setUsers(users.filter(user =>
            user.id !== id
        ));
    };

    const startEdit = (user: User) => {
        setEditingId(user.id);
        setUsername(user.username);
        setEmail(user.email);
    };

    const reload = () => {
        setEditingId(null);
        setUsername("");
        setEmail("");
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="p-4">
            <h1 className="font-bold text-2xl">CRUD Operations</h1>
            <div>
                <input
                    className="border p-1"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    className="border p-1"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                {editingId ? (
                    <>
                        <button
                            className="bg-yellow-500 text-white px-2 py-1 ml-4 mr-4 rounded-lg"
                            onClick={updateUser}
                        >
                            Update
                        </button>
                        <button
                            className="bg-red-500 text-white px-2 py-1 mr-4 rounded-lg"
                            onClick={reload}
                        >
                            Cancel
                        </button>
                    </>
                ) : (
                    <button
                        className="bg-blue-500 text-white px-2 py-1 ml-4 text-white rounded-lg"
                        onClick={createUser}
                    >
                        Add User
                    </button>
                )}
            </div>
            <ul>
                {users.map(user => (
                    <li key={user.id}>
                        <span className={editingId === user.id ? "text-yellow-500" : ""}>
                            {user.username} ({user.email})
                        </span>
                        <button
                            className="text-yellow-500 ml-24"
                            onClick={() => startEdit(user)}
                        >
                            Edit
                        </button>
                        <button
                            className="text-red-500 ml-2"
                            onClick={() => deleteUser(user.id)}
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
