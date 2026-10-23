# Product: Admin sales visibility

## Problem
Organizers cannot tell how their events are really selling.

- The event list has a "Sold" column, but it shows how many ticket types the event has, not how many tickets were sold. An event that has sold every ticket still says "Active".
- The dashboard gives one grand total of tickets sold. There is no way to see the count for each event.
- The ticket orders list cannot be narrowed to one event, and it does not show net revenue, meaning what has been earned after refunds.
- Organizers who collect money on several Telebirr numbers cannot see how much landed on each number, so they cannot match their sales against their Telebirr statements.
- If an event is postponed, the organizer needs buyers' tickets to stay good for the new date, without anyone having to buy again or ask for a new ticket.

## Success metric
Time for an organizer to find, for one event, the tickets sold, the net revenue and the amount received on each Telebirr number: under 30 seconds with no export and no hand counting. Today it cannot be done in the app at all.

## Announcement — the blog post before the feature
Know exactly how every event is selling. Your event list now shows real tickets sold and marks an event Sold Out the moment the last ticket goes. Open any event to see sales for each ticket type, and filter your orders to a single event to see your net revenue after refunds. If you collect payments on more than one Telebirr number, you now see how many tickets and how many birr arrived on each, so your sales match your Telebirr statements. And if you have to postpone an event, mark it Postponed with the new date: everyone who already bought can use their ticket on the new day, with nothing for them to do.

## Screens
- `mockups/1-event-list.html` — Event management table with real Sold counts and a Sold Out badge.
- `mockups/2-event-sales.html` — One event's sales: tickets sold per ticket type, and per Telebirr number.
- `mockups/3-ticket-orders.html` — Ticket orders filtered by event, with net revenue.
- `mockups/4-postpone.html` — Organizer marks an event Postponed, and what the buyer sees.

## Product rules proposed (please confirm or change)
1. **Sold Out** means every ticket type of the event is sold out. If only some types are sold out, the event stays Active and the row shows e.g. "VIP sold out".
2. **Sold** counts tickets (not orders). An order of 3 tickets adds 3. Only paid orders count; pending and expired orders do not.
3. **Net revenue** = money from paid orders minus any refunded orders. There are no platform fees for now, so nothing else is deducted. Orders that are only pending are not revenue yet. (The dashboard's existing 10% commission card is not touched by this feature.)
4. **Postponed**: the organizer sets the event to Postponed and enters the new date (or "date to be announced"). Existing tickets stay valid and work at the gate on the new date. The event page shows "Postponed" with the new date. Selling continues unless the organizer closes it. Refunds are not part of this feature.
5. **Per Telebirr number**: for every paid order we record which of the organizer's numbers received the money, then show tickets sold and birr total for each number. Orders paid before this feature cannot be assigned to a number, so they show in a separate row, "Before tracking".
6. An organizer only ever sees their own events and orders.

## Open questions for the product owner
- Do your Telebirr numbers have different account-holder names? Today a payment is matched by the holder's name on the receipt, so two numbers with the same name cannot be told apart.
- For a postponed event, should buyers get any message (SMS or notification), or is the banner on the event page and ticket enough?
