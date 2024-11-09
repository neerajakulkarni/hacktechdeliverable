import "./App.css";
import React, { useEffect, useState } from "react";
import quotebook from '/assets/quotebook.png';


function App() {
    const [quotes, setQuotes] = useState([]);
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");
    const [maxAge, setMaxAge] = useState("all");

	const getQuotes = async()=> {
		try {
            const response = await fetch(`/api/display?max_age=${maxAge}`);
			if (!response.ok)
				throw new Error(`error: ${response.statusText}`);
			
			const data = await response.json();
			setQuotes(data);
		} catch (error) {
			console.error("Error fetching quotes:", error);
		}
	};

    useEffect(() => {
        getQuotes();
    }, [maxAge]);

	const handleSubmit = async (event) => {
		event.preventDefault();
		const formData = new FormData();
		formData.append("name", name);
		formData.append("message", message);
		try {
			await fetch("/api/quote", {
				method: "post",
				body: formData,
			});
			setName("");
			setMessage("");
			getQuotes(); 
		} catch (error) {
			console.error("Error submitting quote:", error);
		}
	};

	const formatDate = (dateString) => {
        const date = new Date(dateString);
        const month = date.getMonth() + 1; 
        const day = date.getDate();
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    };

	return (
		<div className="App">
			<div className="container">
				<div className="header">
					<img src={quotebook} className="quote-icon" />
					<h1>Hack at UCI Tech Deliverable</h1>
				</div>

				<h2>Submit a Quote</h2>
				<form onSubmit={handleSubmit} className="submit-quote">
					<label htmlFor="input-name">Name</label>
					<input
						type="text"
						name="name"
						id="input-name"
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
					/>
					<label htmlFor="input-message">Quote</label>
					<input
						type="text"
						name="message"
						id="input-message"
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						required
					/>
					<button type="submit">Submit</button>
				</form>

				<h2>Filter by Age</h2>
				<select value={maxAge} onChange={(e) => setMaxAge(e.target.value)} className="filter-age">
					<option value="today">Today</option>
					<option value="week">Last Week</option>
					<option value="month">Last Month</option>
					<option value="year">Last Year</option>
					<option value="all">All Time</option>
				</select>

				<h2>Previous Quotes</h2>
				<div className="quotes-section">
					{quotes.map((quote, index) => (
						<div key={index} className="quote-card">
							<div className="quote-name">{quote.name}</div>
							<div className="quote-message">{quote.message}</div>
							<div className="quote-date">{formatDate(quote.time)}</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

export default App;