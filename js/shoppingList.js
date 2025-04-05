// Shopping List Generation Service

function generateShoppingList(mealPlan) {
    const ingredientMap = new Map();

    // Iterate through each day and meal
    Object.values(mealPlan.meals).forEach(day => {
        Object.values(day).forEach(meal => {
            if (meal && meal.recipe && meal.recipe.ingredients) {
                meal.recipe.ingredients.forEach(ingredient => {
                    const key = ingredient.name.toLowerCase();
                    if (ingredientMap.has(key)) {
                        const existing = ingredientMap.get(key);
                        existing.amount += (ingredient.amount * mealPlan.servings);
                    } else {
                        ingredientMap.set(key, {
                            name: ingredient.name,
                            amount: ingredient.amount * mealPlan.servings,
                            unit: ingredient.unit
                        });
                    }
                });
            }
        });
    });

    return Array.from(ingredientMap.values());
}

function formatShoppingList(ingredients) {
    let categorizedIngredients = {};

    // Categorize ingredients
    ingredients.forEach(ingredient => {
        const category = categorizeIngredient(ingredient.name);
        if (!categorizedIngredients[category]) {
            categorizedIngredients[category] = [];
        }
        categorizedIngredients[category].push(ingredient);
    });

    // Generate HTML for printing
    let html = `
        <div class="shopping-list-container">
            <h2>Shopping List</h2>
            <p class="print-date">Generated on ${new Date().toLocaleDateString()}</p>
    `;

    Object.entries(categorizedIngredients).forEach(([category, items]) => {
        html += `
            <div class="category-section">
                <h3>${category}</h3>
                <ul>
        `;

        items.forEach(item => {
            html += `
                <li>
                    <span class="ingredient-name">${item.name}</span>
                    <span class="ingredient-amount">${formatAmount(item.amount)} ${item.unit || ''}</span>
                </li>
            `;
        });

        html += `
                </ul>
            </div>
        `;
    });

    html += '</div>';
    return html;
}

function categorizeIngredient(name) {
    const categories = {
        'Produce': ['vegetable', 'fruit', 'lettuce', 'tomato', 'onion', 'potato'],
        'Meat & Seafood': ['chicken', 'beef', 'pork', 'fish', 'shrimp'],
        'Dairy & Eggs': ['milk', 'cheese', 'yogurt', 'cream', 'butter', 'egg'],
        'Pantry': ['flour', 'sugar', 'oil', 'vinegar', 'sauce', 'spice', 'herb'],
        'Grains': ['rice', 'pasta', 'bread', 'cereal'],
        'Canned Goods': ['can', 'soup', 'bean', 'tomato sauce'],
        'Frozen': ['frozen']
    };

    const lowercaseName = name.toLowerCase();
    for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(keyword => lowercaseName.includes(keyword))) {
            return category;
        }
    }
    return 'Other';
}

function formatAmount(amount) {
    return Number.isInteger(amount) ? amount : amount.toFixed(2);
}

function printShoppingList(mealPlan) {
    const ingredients = generateShoppingList(mealPlan);
    const html = formatShoppingList(ingredients);

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Shopping List</title>
            <style>
                .shopping-list-container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                    font-family: Arial, sans-serif;
                }
                .print-date {
                    color: #666;
                    font-style: italic;
                }
                .category-section {
                    margin-bottom: 20px;
                }
                .category-section h3 {
                    color: #333;
                    border-bottom: 2px solid #eee;
                    padding-bottom: 5px;
                }
                .ingredient-name {
                    display: inline-block;
                    width: 70%;
                }
                .ingredient-amount {
                    display: inline-block;
                    width: 30%;
                    text-align: right;
                }
                @media print {
                    .shopping-list-container {
                        padding: 0;
                    }
                    .no-print {
                        display: none;
                    }
                }
            </style>
        </head>
        <body>
            ${html}
            <div class="no-print">
                <button onclick="window.print()">Print List</button>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// Export functions
window.generateShoppingList = generateShoppingList;
window.printShoppingList = printShoppingList;