/*
 * Copyright (c) 2013 - 2014, University of Massachusetts Amherst
 * All Rights Reserved.
 */
package laser.bt.agents;

import java.io.Serializable;
import java.util.LinkedHashSet;
import java.util.Random;
import java.util.Set;

import laser.bt.exceptions.FailedProductCheck;
import laser.bt.exceptions.PatientBloodTypeUnavailable;
import laser.bt.exceptions.WrongPatient;
import laser.juliette.agent.ItemHandlerAdapter;
import laser.juliette.ams.AMSException;
import laser.juliette.ams.AgendaItem;
import laser.juliette.ams.IllegalTransition;
import laser.juliette.agent.ItemHandler;


public class NurseItemHandler extends ItemHandlerAdapter
{
	private AgendaItem agendaItem_;
	private MercutioClient mercutio;

	public NurseItemHandler(AgendaItem item, MercutioClient mercutio) {
		super();
		// System.out.println("Initiating NurseItem");
		this.agendaItem_ = item;
		this.mercutio = mercutio;
	}

	@Override
	public void posted() {
		try {
			// System.out.println("\tStep: " + this.agendaItem_.getStep().getName());
			this.mercutio.sendStep(this.agendaItem_.getStep().getName());
			this.agendaItem_.start();
			this.agendaItem_.complete();
		} catch (AMSException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}
