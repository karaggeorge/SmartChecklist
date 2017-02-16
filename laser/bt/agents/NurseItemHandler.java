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
	private ClientControler controler;

	public NurseItemHandler(AgendaItem item, ClientControler controler) {
		super();
		// System.out.println("Initiating NurseItem");
		this.agendaItem_ = item;
		this.controler = controler;
	}

	@Override
	public void posted() {
			System.out.println("Juliette posting item");
			this.controler.postItem(this.agendaItem_);
	}
}
