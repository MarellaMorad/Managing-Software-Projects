import React, { useEffect, useState } from 'react';
import { fetchProducts, updateProduct } from '../../Supabase/supabaseService';
import {Bar, Doughnut, Pie} from 'react-chartjs-2';
import './ProductsDashboard.css';
import 'chartjs-adapter-date-fns';
import {CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, Chart, ArcElement} from 'chart.js';

const LOW_STOCK_THRESHOLD = 5; // Define a threshold to determine when stock is "low"
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const ProductsDashboard = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const getProducts = async () => {
            const fetchedProducts = await fetchProducts();
            setProducts(fetchedProducts);
        };

        getProducts();
    }, []);

    useEffect(() => {
        products.forEach(product => {
            if (product.stock_quantity <= LOW_STOCK_THRESHOLD) {
                reorderStock(product);
            }
        });
    }, [products]);

    const reorderStock = (product) => {
        const reorderedProduct = {
            ...product,
            stock_quantity: product.stock_quantity + 10 // Reorder quantity
        };
        updateProduct(reorderedProduct);
    };

    const dataBar = {
        labels: products.map(p => p.product_name),
        datasets: [{
            label: 'Stock Quantity',
            data: products.map(p => p.stock_quantity),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }]
    };

    const dataPie = {
        labels: products.map(p => p.product_name),
        datasets: [{
            data: products.map(p => p.stock_quantity),
            backgroundColor: products.map(() => '#' + Math.floor(Math.random()*16777215).toString(16))
        }]
    };

    const dataDoughnut = {
        labels: products.map(p => p.product_name),
        datasets: [{
            data: products.map(p => p.price * p.stock_quantity),
            backgroundColor: products.map(() => '#' + Math.floor(Math.random()*16777215).toString(16))
        }]
    };

    const totalStockValue = products.reduce((total, p) => total + (p.price * p.stock_quantity), 0);
    const lowStockProducts = products.filter(p => p.stock_quantity <= LOW_STOCK_THRESHOLD);

    const optionsBar = {
        plugins: {
            legend: {
                display: true,
                position: 'top',
            }
        },
        animation: {
            tension: {
                duration: 1000,
                easing: 'easeInOutCubic',
                from: 1,
                to: 0,
                loop: true
            }
        },
        hover: {
            animationDuration: 1000,
        },
        responsiveAnimationDuration: 1000,
    };

    const optionsPieDoughnut = {
        plugins: {
            legend: {
                display: true,
                position: 'top',
            }
        },
        animation: {
            animateScale: true,
            animateRotate: true,
            duration: 1000,
        },
    };

    return (
        <div className="products-dashboard">
            <h1>Products Analytics Dashboard</h1>

            <section className="info-cards">
                <div className="info-card">
                    <h2>Total Products</h2>
                    <p>{products.length}</p>
                </div>
                <div className="info-card">
                    <h2>Total Stock Value</h2>
                    <p>${totalStockValue.toFixed(2)}</p>
                </div>
            </section>
            <div className="chart-container" style={{height: '40vh', display: "flex", flexDirection: "column", alignItems: "center"}}>
                <h2>Product Stock Quantities</h2>
                <Bar data={dataBar} options={optionsBar} />
            </div>
            <section className="charts">
                <div className="chart-container">
                    <h2>Stock Distribution Across Products</h2>
                    <Pie data={dataPie} options={optionsPieDoughnut} />
                </div>
                <div className="chart-container">
                    <h2>Revenue Potential Per Product</h2>
                    <Doughnut data={dataDoughnut} options={optionsPieDoughnut} />
                </div>
            </section>

            <section className="low-stock">
                <h2>Low Stock Alerts</h2>
                <ul>
                    {lowStockProducts.map(p => (
                        <li key={p.product_id}>{p.product_name} - Only {p.stock_quantity} left in stock!</li>
                    ))}
                </ul>
            </section>
        </div>
    );
}

export default ProductsDashboard;
