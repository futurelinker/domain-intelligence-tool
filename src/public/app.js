// Test API connection
document.getElementById('testApi').addEventListener('click', async () => {
    const resultDiv = document.getElementById('apiResult');
    resultDiv.innerHTML = 'Testing API connection...';
    resultDiv.classList.remove('hidden');
    resultDiv.classList.add('block');
    
    try {
        const response = await fetch('/api/health');
        const data = await response.json();
        
        resultDiv.innerHTML = `
            <strong class="font-semibold">✅ API Response:</strong><br>
            <span class="block mt-2">Status: ${data.status}</span>
            <span class="block mt-1">Message: ${data.message}</span>
            <span class="block mt-1">Version: ${data.version}</span>
            <span class="block mt-1 text-sm text-gray-600">Timestamp: ${data.timestamp}</span>
        `;
        resultDiv.className = 'block mt-5 p-4 rounded-lg bg-green-50 border border-green-200';
    } catch (error) {
        resultDiv.innerHTML = `
            <strong class="font-semibold">❌ API Error:</strong><br>
            <span class="block mt-2 text-red-700">${error.message}</span>
        `;
        resultDiv.className = 'block mt-5 p-4 rounded-lg bg-red-50 border border-red-200';
    }
});