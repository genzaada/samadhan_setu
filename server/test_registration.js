const testRegistration = async () => {
    try {
        const user = {
            name: "Test User",
            email: `test${Date.now()}@example.com`,
            password: "password123",
            role: "citizen"
        };

        console.log("Attempting to register:", user.email);
        const res = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });

        if (res.status === 201) {
            console.log("✅ Registration Successful!");
            const data = await res.json();
            console.log(data);
        } else {
            console.log("❌ Registration Failed with status:", res.status);
            const text = await res.text();
            console.log(text);
        }
    } catch (error) {
        console.log("❌ Network/Server Error:", error.message);
    }
};

testRegistration();
