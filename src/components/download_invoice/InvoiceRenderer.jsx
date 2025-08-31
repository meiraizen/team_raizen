import React from 'react'; 

const InvoiceRenderer = ({ data }) => {
  return (
    <div
      style={{
        width: '800px',
        padding: 20,
        background: '#fff',
        fontFamily: 'Arial',
      }}
    >
      <h2>Invoice: {data.id}</h2>
      <p>
        <strong>Customer:</strong> {data.customer_name}
      </p>
      <p>
        <strong>Email:</strong> {data.customer_email}
      </p>
      <p>
        <strong>Date:</strong> {data.date}
      </p>

      <h4>Fee Paid</h4>
      {/* <ul>
        {data.items.map((item, idx) => (
          <li key={idx}>
            {item.name} — {item.quantity} × ${item.price.toFixed(2)}
          </li>
        ))}
      </ul> */}

      <p>
        <strong>Total:</strong> ₹{data.amount.toFixed(2)}
      </p>
      {data.notes && (
        <p>
          {/* <em>Note: {data.notes}</em> */}
          <em>No due</em>

        </p>
      )}
    </div>
  );
};

export default InvoiceRenderer;
