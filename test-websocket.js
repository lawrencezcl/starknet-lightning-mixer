const WebSocket = require('ws');

console.log('🔌 Testing WebSocket connection to Starknet Lightning Mixer...');
console.log(`📡 Connecting to: ws://38.14.254.46:3002`);

const ws = new WebSocket('ws://38.14.254.46:3002');

let connected = false;
let messagesReceived = 0;
let subscriptionActive = false;

ws.on('open', function open() {
  console.log('✅ WebSocket connected successfully');
  connected = true;

  // Subscribe to transaction updates
  const subscribeMessage = {
    type: 'subscribe',
    transactionId: 'tx_2_1759641199569'
  };

  console.log('📤 Sending subscription message:', JSON.stringify(subscribeMessage, null, 2));
  ws.send(JSON.stringify(subscribeMessage));
  subscriptionActive = true;
});

ws.on('message', function message(data) {
  const parsedData = JSON.parse(data);
  messagesReceived++;
  console.log(`📥 Message ${messagesReceived}:`, JSON.stringify(parsedData, null, 2));

  if (parsedData.type === 'transactionUpdate') {
    console.log(`🔄 Transaction Update: Status=${parsedData.status}, Progress=${parsedData.progress}%`);
  }

  if (parsedData.type === 'transactionCompleted') {
    console.log('🎉 Transaction completed!');
    console.log('📊 Final result:', parsedData.result);

    // Unsubscribe after completion
    setTimeout(() => {
      if (subscriptionActive) {
        console.log('📤 Sending unsubscribe message...');
        ws.send(JSON.stringify({ type: 'unsubscribe' }));
        subscriptionActive = false;
      }

      // Close connection after unsubscribe
      setTimeout(() => {
        console.log('🔌 Closing WebSocket connection...');
        ws.close();
      }, 1000);
    }, 1000);
  }
});

ws.on('close', function close() {
  console.log('❌ WebSocket connection closed');
  console.log(`📊 Total messages received: ${messagesReceived}`);
  connected = false;
});

ws.on('error', function error(err) {
  console.error('❌ WebSocket error:', err.message);
  connected = false;
});

// Timeout after 15 seconds
setTimeout(() => {
  if (connected) {
    console.log('⏰ Test timeout - closing connection...');
    ws.close();
  }
}, 15000);