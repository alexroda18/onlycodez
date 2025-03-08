import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

// This is a simplified webhook handler for Shopify order creation
// In a production environment, you would need to verify the webhook signature
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { 
      order_id, 
      customer_email, 
      line_items 
    } = req.body;

    // Validate required fields
    if (!order_id || !customer_email || !line_items) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get user ID from email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', customer_email)
      .single();

    if (userError || !userData) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userId = userData.id;

    // Process each line item (template) in the order
    const templateInserts = line_items.map(async (item: any) => {
      // Extract template ID from product metadata or SKU
      // This is a simplified example - you would need to adapt this to your Shopify setup
      const templateId = item.sku || item.product_id;
      
      // Check if template exists
      const { data: templateData, error: templateError } = await supabase
        .from('templates')
        .select('id')
        .eq('id', templateId)
        .single();

      if (templateError || !templateData) {
        console.error(`Template not found: ${templateId}`);
        return null;
      }

      // Add template to user's purchased templates
      const { data, error } = await supabase
        .from('user_templates')
        .insert({
          user_id: userId,
          template_id: templateId,
          purchased_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error adding template to user:', error);
        return null;
      }

      return data;
    });

    await Promise.all(templateInserts);

    return res.status(200).json({ message: 'Order processed successfully' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 