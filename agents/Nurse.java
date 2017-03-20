/*
 * Copyright (c) 2013, University of Massachusetts Amherst
 * All Rights Reserved.
 */
package agents;

import laser.juliette.agent.AbstractAgent;
import laser.juliette.agent.ItemHandler;
import laser.juliette.agent.ItemHandlerFactory;
import laser.juliette.ams.AMSException;
import laser.juliette.ams.AgendaItem;

public class Nurse extends AbstractAgent {
        protected void configureAgent() {

          System.out.println("Nurse class started");
          MercutioClient mercutio = new MercutioClient();
          ClientControler controler = new ClientControler(mercutio);
          mercutio.setControler(controler);

          Thread t = new Thread(new Runnable() {
              public void run() {
                mercutio.run();
              }
          });

          t.start();

          System.out.println("Setting up Factory");
          setItemHandlerFactory(new ItemHandlerFactory() {
                  public ItemHandler createItemHandler(AgendaItem item) {
                          return new NurseItemHandler(item, controler);
                  }
          });
          setProcessingMode(ProcessingMode.EXISTING_AND_NEW);
            // setItemFilter() can be called here to specify an item filter
        }
}
