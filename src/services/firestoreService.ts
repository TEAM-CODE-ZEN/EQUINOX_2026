import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  runTransaction,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db, isDemoMode } from './firebase';
import {
  Ticket,
  TicketComment,
  UserProfile,
  TicketStatus,
} from '../types';
import {
  DEMO_COMMUNITIES,
  INITIAL_DEMO_TICKETS,
  INITIAL_MEMBERSHIPS,
} from './mockData';

class FirestoreService {
  private isLive(): boolean {
    return !isDemoMode;
  }

  // Initialize and seed empty Firestore collection if needed
  async initFirestoreCollections(): Promise<void> {
    if (!this.isLive()) return;

    try {
      // Check if tickets collection is empty
      const ticketsSnap = await getDocs(collection(db, 'tickets'));
      if (ticketsSnap.empty) {
        console.log('Seeding initial tickets to Firestore...');
        for (const tkt of INITIAL_DEMO_TICKETS) {
          await setDoc(doc(db, 'tickets', tkt.id), tkt);
        }
      }

      // Check communities
      const commSnap = await getDocs(collection(db, 'communities'));
      if (commSnap.empty) {
        for (const comm of DEMO_COMMUNITIES) {
          await setDoc(doc(db, 'communities', comm.id), comm);
        }
      }



      // Check memberships
      const memSnap = await getDocs(collection(db, 'committeeMemberships'));
      if (memSnap.empty) {
        for (const mem of INITIAL_MEMBERSHIPS) {
          await setDoc(doc(db, 'committeeMemberships', mem.id), mem);
        }
      }
    } catch (err) {
      console.warn('Firestore initial check or permissions notice:', err);
    }
  }

  // Real-time listener for tickets
  subscribeTickets(callback: (tickets: Ticket[]) => void): () => void {
    if (!this.isLive()) return () => {};

    try {
      const q = query(collection(db, 'tickets'), orderBy('createdAt', 'desc'));
      return onSnapshot(
        q,
        (snapshot: any) => {
          const list: Ticket[] = [];
          snapshot.forEach((d: any) => list.push(d.data() as Ticket));
          callback(list);
        },
        (error: any) => {
          console.warn('Firestore tickets snapshot listener warning:', error);
        }
      );
    } catch {
      return () => {};
    }
  }

  // Save new or updated ticket
  async saveTicket(ticket: Ticket): Promise<void> {
    if (!this.isLive()) return;
    try {
      await setDoc(doc(db, 'tickets', ticket.id), ticket);
    } catch (e) {
      console.error('Firestore saveTicket error:', e);
    }
  }

  // Atomic Endorsement (+1) Transaction in Firestore
  async toggleEndorsement(
    ticketId: string,
    userUid: string,
    actorName: string
  ): Promise<{ success: boolean; endorsed: boolean; affectedCount: number }> {
    if (!this.isLive()) return { success: false, endorsed: false, affectedCount: 0 };

    const ticketRef = doc(db, 'tickets', ticketId);
    const endorsementRef = doc(db, 'tickets', ticketId, 'endorsements', userUid);

    try {
      return await runTransaction(db, async (transaction: any) => {
        const ticketDoc = await transaction.get(ticketRef);
        if (!ticketDoc.exists()) {
          throw new Error('Ticket does not exist');
        }

        const data = ticketDoc.data() as Ticket;
        const currentEndorsed: string[] = data.endorsedUserIds || [];
        const hasEndorsed = currentEndorsed.includes(userUid);

        let newEndorsedList: string[];
        let newCount: number;
        let endorsedStatus: boolean;

        if (hasEndorsed) {
          // Remove endorsement
          newEndorsedList = currentEndorsed.filter((id) => id !== userUid);
          newCount = Math.max(1, (data.affectedCount || 1) - 1);
          endorsedStatus = false;
          transaction.delete(endorsementRef);
        } else {
          // Add endorsement
          newEndorsedList = [...currentEndorsed, userUid];
          newCount = (data.affectedCount || 1) + 1;
          endorsedStatus = true;
          transaction.set(endorsementRef, {
            userId: userUid,
            userName: actorName,
            endorsedAt: new Date().toISOString(),
          });
        }

        transaction.update(ticketRef, {
          endorsedUserIds: newEndorsedList,
          affectedCount: newCount,
          updatedAt: new Date().toISOString(),
        });

        return { success: true, endorsed: endorsedStatus, affectedCount: newCount };
      });
    } catch (err) {
      console.error('Firestore toggleEndorsement transaction failed:', err);
      return { success: false, endorsed: false, affectedCount: 0 };
    }
  }

  // Update Status in Firestore
  async updateTicketStatus(
    ticketId: string,
    newStatus: TicketStatus,
    actor: UserProfile,
    resolutionNotes?: string
  ): Promise<boolean> {
    if (!this.isLive()) return false;
    const ticketRef = doc(db, 'tickets', ticketId);

    try {
      const updateData: any = {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      };
      if (resolutionNotes) {
        updateData.resolutionNotes = resolutionNotes;
      }

      await updateDoc(ticketRef, updateData);

      // Save audit history event subdocument
      const histId = `hist-${Date.now()}`;
      await setDoc(doc(db, 'tickets', ticketId, 'history', histId), {
        id: histId,
        ticketId,
        eventType: newStatus === 'Resolved' ? 'RESOLVED' : newStatus === 'Reopened' ? 'REOPENED' : 'STATUS_CHANGED',
        actorUid: actor.uid,
        actorName: actor.name,
        description: resolutionNotes ? `Status changed to ${newStatus}. Note: ${resolutionNotes}` : `Status changed to ${newStatus}`,
        timestamp: new Date().toISOString(),
      });

      return true;
    } catch (err) {
      console.error('Firestore updateTicketStatus error:', err);
      return false;
    }
  }

  // Assign Ticket in Firestore
  async assignTicket(
    ticketId: string,
    staffUid: string,
    staffName: string,
    actor: UserProfile
  ): Promise<boolean> {
    if (!this.isLive()) return false;
    const ticketRef = doc(db, 'tickets', ticketId);

    try {
      await updateDoc(ticketRef, {
        assignedToStaffUid: staffUid,
        assignedStaffName: staffName,
        status: 'Assigned',
        updatedAt: new Date().toISOString(),
      });

      const histId = `hist-${Date.now()}`;
      await setDoc(doc(db, 'tickets', ticketId, 'history', histId), {
        id: histId,
        ticketId,
        eventType: 'ASSIGNED',
        actorUid: actor.uid,
        actorName: actor.name,
        description: `Assigned to ${staffName}`,
        newValue: staffName,
        timestamp: new Date().toISOString(),
      });

      return true;
    } catch (err) {
      console.error('Firestore assignTicket error:', err);
      return false;
    }
  }

  // Add Comment to Firestore subcollection
  async addComment(comment: TicketComment): Promise<void> {
    if (!this.isLive()) return;
    try {
      await setDoc(
        doc(db, 'tickets', comment.ticketId, 'comments', comment.id),
        comment
      );
    } catch (err) {
      console.error('Firestore addComment error:', err);
    }
  }

}

export const firestoreService = new FirestoreService();
